import { GoogleSignIn } from '@/app/actions/cy/visitor';

export default function GoogleButton() {

    return (
        <form
            action={GoogleSignIn}
        >
            <button type="submit">Signin with Google</button>
        </form>
    );
}