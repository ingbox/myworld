'use client';

import { useEffect, useRef } from 'react';
import { 
    AnimatedSprite,
    Application,
    Assets,
    Container,
    Sprite,
    Texture,
} from 'pixi.js';
import { updateFollowCamera } from './camera';
import {
    CHARACTER_SHEET,
    CharacterDirection,
    getCharacterTextures,
} from './characterSpritesheet';
import { LIVING_ROOM_MAP } from './maps/livingRoom';
import type { MapDef } from './maps/types';

const MOVE_SPEED = 2.5;
const WALK_ANIMATION_SPEED = 0.18;
const WALL_PADDING = 56;

type ViewportSize = { width: number; height: number };

function readViewportSize(host: HTMLElement): ViewportSize {
    const rect = host.getBoundingClientRect();
    return {
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
    };
}

type MovementKeys = Record<'up' | 'down' | 'left' | 'right', boolean>;

function createMovementKeys(): MovementKeys {
    return { up: false, down: false, left: false, right: false };
}

const KEY_MAP: Record<string, keyof MovementKeys> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
};

function getMovementKey(key: string): keyof MovementKeys | null {
    return KEY_MAP[key] ?? null;
}

function resolveDirection(vx: number, vy: number): CharacterDirection {
    if (Math.abs(vx) > Math.abs(vy)) {
        return vx > 0 ? 'right' : 'left';
    }
    return vy > 0 ? 'down' : 'up';
}

function moveTowardTarget(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    speed: number,
) {
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.hypot(dx, dy);

    if (distance <= speed) {
        return { x: targetX, y: targetY, arrived: true, vx: 0, vy: 0 };
    }

    return {
        x: x + (dx / distance) * speed,
        y: y + (dy / distance) * speed,
        arrived: false,
        vx: (dx / distance) * speed,
        vy: (dy / distance) * speed,
    };
}

function clampToMap(x: number, y: number, map: MapDef) {
    return {
        x: Math.min(Math.max(x, WALL_PADDING), map.width - WALL_PADDING),
        y: Math.min(Math.max(y, WALL_PADDING + 20), map.height - WALL_PADDING),
    };
}

async function buildMapWorld(map: MapDef) {
    const world = new Container();

    const backgroundTexture = (await Assets.load(map.background)) as Texture;
    const background = new Sprite(backgroundTexture);
    background.eventMode = 'static';
    background.cursor = 'pointer';
    world.addChild(background);

    const gameLayer = new Container();
    gameLayer.sortableChildren = true;
    world.addChild(gameLayer);

    for (const object of map.objects) {
        const texture = (await Assets.load(object.texture)) as Texture;
        const sprite = new Sprite(texture);
        sprite.anchor.set(object.anchorX ?? 0.5, object.anchorY ?? 1);
        sprite.scale.set(object.scale ?? 1);
        sprite.x = object.x;
        sprite.y = object.y;
        sprite.zIndex = object.y + (object.sortYOffset ?? 0);
        sprite.label = object.id;
        sprite.eventMode = 'none';
        gameLayer.addChild(sprite);
    }

    return { world, gameLayer, background };
}

export default function MiniRoom() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = containerRef.current;
        if (!host) return;

        let app: Application | null = null;
        let cancelled = false;
        let resizeObserver: ResizeObserver | null = null;
        const viewport: ViewportSize = { width: 1, height: 1 };

        const keys = createMovementKeys();
        const map = LIVING_ROOM_MAP;

        const resizeToHost = (application: Application) => {
            const next = readViewportSize(host);
            viewport.width = next.width;
            viewport.height = next.height;
            application.renderer.resize(next.width, next.height);
        };

        const onKeyDown = (event: KeyboardEvent) => {
            const movementKey = getMovementKey(event.key);
            if (movementKey) {
                keys[movementKey] = true;
                event.preventDefault();
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            const movementKey = getMovementKey(event.key);
            if (movementKey) {
                keys[movementKey] = false;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        (async () => {
            const initialSize = readViewportSize(host);
            viewport.width = initialSize.width;
            viewport.height = initialSize.height;

            const application = new Application();
            await application.init({
                width: initialSize.width,
                height: initialSize.height,
                backgroundColor: 0x1a1a2e,
                antialias: true,
                autoDensity: true,
                resolution: window.devicePixelRatio || 1,
            });

            if (cancelled) {
                application.destroy(true);
                return;
            }

            app = application;
            const canvas = application.canvas as HTMLCanvasElement;
            canvas.style.display = 'block';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            host.appendChild(canvas);

            resizeObserver = new ResizeObserver(() => {
                requestAnimationFrame(() => {
                    if (cancelled || !app) return;
                    resizeToHost(app);
                });
            });
            resizeObserver.observe(host);

            const { world, gameLayer, background } = await buildMapWorld(map);
            application.stage.addChild(world);
            application.stage.eventMode = 'passive';

            const sheet = (await Assets.load(CHARACTER_SHEET.url)) as Texture;

            let direction: CharacterDirection = 'down';
            let prevMoving = false;
            let prevDirection: CharacterDirection = direction;
            let clickTarget: { x: number; y: number } | null = null;

            background.on('pointerdown', (event) => {
                const point = world.toLocal(event.global);
                clickTarget = clampToMap(point.x, point.y, map);
            });

            const character = new AnimatedSprite({
                textures: getCharacterTextures(sheet, direction, false),
                animationSpeed: WALK_ANIMATION_SPEED,
            });
            character.anchor.set(0.5, 1);
            character.scale.set(CHARACTER_SHEET.scale);
            character.x = map.spawn.x;
            character.y = map.spawn.y;
            character.gotoAndStop(0);
            character.label = 'character';
            character.eventMode = 'none';
            gameLayer.addChild(character);

            application.ticker.add(() => {
                let vx = 0;
                let vy = 0;

                const keyboardMoving =
                    keys.up || keys.down || keys.left || keys.right;

                if (keyboardMoving) {
                    clickTarget = null;
                    vx =
                        (keys.right ? MOVE_SPEED : 0) -
                        (keys.left ? MOVE_SPEED : 0);
                    vy =
                        (keys.down ? MOVE_SPEED : 0) -
                        (keys.up ? MOVE_SPEED : 0);
                } else if (clickTarget) {
                    const moved = moveTowardTarget(
                        character.x,
                        character.y,
                        clickTarget.x,
                        clickTarget.y,
                        MOVE_SPEED,
                    );

                    if (moved.arrived) {
                        clickTarget = null;
                    }

                    vx = moved.vx;
                    vy = moved.vy;
                }

                const isMoving = vx !== 0 || vy !== 0;

                if (isMoving) {
                    direction = resolveDirection(vx, vy);
                    character.x += vx;
                    character.y += vy;

                    const clamped = clampToMap(character.x, character.y, map);
                    character.x = clamped.x;
                    character.y = clamped.y;
                }

                character.zIndex = character.y;

                updateFollowCamera(
                    world,
                    character.x,
                    character.y,
                    viewport.width,
                    viewport.height,
                    map.width,
                    map.height,
                );

                const directionOrMotionChanged =
                    isMoving !== prevMoving || direction !== prevDirection;

                if (directionOrMotionChanged) {
                    character.textures = getCharacterTextures(
                        sheet,
                        direction,
                        isMoving,
                    );

                    if (isMoving) {
                        character.play();
                    } else {
                        character.gotoAndStop(0);
                    }

                    prevMoving = isMoving;
                    prevDirection = direction;
                }
            });
        })();

        return () => {
            cancelled = true;
            resizeObserver?.disconnect();
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            app?.destroy(true, { children: true });
            host.replaceChildren();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-[616px] aspect-616/300 overflow-hidden rounded-sm"
            tabIndex={0}
        />
    );
}
