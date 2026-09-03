'use client'
import { deleteVisitor, editVisitor, reportVisitor, secretVisitor } from "@/src/lib/api/cy/visitor/action";
import Image from "next/image";
import { useState } from "react";

export default function Visitor({ user, visitor, getPostNumber }: { user: any, visitor: any, getPostNumber: any }) {

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(visitor.content);

  const handleSecret = async () => {
    const confirm = window.confirm("정말 비밀로 하시겠습니까?");
    if (!confirm) return;
    const response = await secretVisitor(visitor.id);

    if (!response.success) {
      alert(response.message);
      return;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  }

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue(visitor.content);
  }

  const handleEditSave = async () => {
    const confirm = window.confirm("정말 수정하시겠습니까?");
    if (!confirm) return;
    try {
      await editVisitor(visitor.id, editValue);
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm('정말 삭제하시겠습니까?');
    if (!confirm) return;
    deleteVisitor({ visitorId: visitor.id });
  }

  const handleReport = async () => {
    const confirm = window.confirm('정말 신고하시겠습니까?');
    if (!confirm) return;
    const response = await reportVisitor({ visitorId: visitor.id });
    if (!response.success) {
      alert(response.message);
    }
  }

  return (
    <>
      <div className="flex justify-between h-8 bg-gray-50 px-4">

        <div className="flex items-center">
          <span className="text-[10px] text-gray-500 font-ginto leading-8">
            NO.
          </span>
          <span className="text-[12px] text-[#4a60ab] leading-8 mr-2">
            {getPostNumber}
          </span>
          <span className="text-[15px] text-[#4a60ab] mr-2 max-sm:text-[10px]">
            {visitor.user_name}
          </span>
          <span className="text-[13px] text-gray-400 font-ginto leading-8 max-sm:text-[10px]">
            ({visitor.created_at_formatted})
          </span>
        </div>

        <div className="flex items-center">
          <div>
            {
              (user?.email === visitor.user_email && !visitor.is_secret) &&
              <div className="flex">
                <span
                  className="block max-md:hidden text-[14px] text-gray-500 leading-8 cursor-pointer"
                  onClick={handleSecret}
                >
                  비밀로 하기
                </span>
                <Image
                  src="/images/cy/visitor/secret.svg"
                  alt=""
                  width={15}
                  height={15}
                  className="hidden max-md:block cursor-pointer"
                  onClick={handleSecret}
                />
                <span className="text-[14px] text-gray-500 leading-8 px-1">|</span>
              </div>
            }
          </div>

          {
            (user?.email === visitor.user_email) &&
            <div className="flex">
              {/* 데스크톱 */}
              <span
                className="block max-md:hidden text-[14px] text-gray-500 leading-8 cursor-pointer"
                onClick={handleEdit}
              >
                수정
              </span>
              <Image
                src="/images/cy/visitor/edit.svg"
                alt=""
                width={15}
                height={15}
                className="hidden max-md:block cursor-pointer"
                onClick={handleEdit}
              />
              <span className="text-[14px] text-gray-500 leading-8 px-1">|</span>
              {/* 모바일 */}
            </div>
          }

          <div>
            {
              user?.email === visitor.user_email &&
              <div className="flex">
                <span
                  className="block max-md:hidden text-[14px] text-gray-500 leading-8 cursor-pointer"
                  onClick={handleDelete}
                >
                  삭제
                </span>
                <Image
                  src="/images/cy/visitor/delete.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="hidden max-md:block cursor-pointer"
                  onClick={handleDelete}
                />
                <span className="text-[14px] text-gray-500 leading-8 px-1">|</span>
              </div>
            }
          </div>

          {
            user &&
            <div className="flex">
              <span
                className="block max-md:hidden text-[14px] text-gray-500 leading-8 cursor-pointer"
                onClick={handleReport}
              >
                신고
              </span>
              <Image
                src="/images/cy/visitor/report.svg"
                alt=""
                width={14}
                height={14}
                className="hidden max-md:block cursor-pointer"
                onClick={handleReport}
              />
            </div>
          }
        </div>
      </div>
      <div className="pt-4 px-4 flex mb-8">
        <div className="w-30 h-30 max-md:w-15 max-md:h-15 bg-white flex items-center justify-center overflow-hidden rounded mr-4">
          <Image
            src={visitor.profile_image_url || '/images/cy/common/noimage.jpg'}
            alt=""
            width={120}
            height={120}
            className="object-contain w-full h-full"
            unoptimized
          />
        </div>
        <div className="flex-1">
          {
            (visitor.is_secret && !isEditing) &&
            <div className="flex items-center gap-1">
              <Image src="/images/cy/visitor/lock2.png" width={12} height={12} alt=""></Image>
              <p className="text-[13px] text-[#b5b18c] leading-5">비밀이야(이 글은 홈주인과 작성자만 볼 수 있어요)</p>
            </div>
          }
          {isEditing ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleEditSave();
              }}
            >
              <textarea
                className="w-full h-30 text-[15px] text-gray-600 bg-white border border-gray-300 p-1"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                rows={5}
              />
              <div className="flex gap-2 mt-1 justify-end">
                <button type="button" onClick={handleEditCancel} className="text-sm w-10 h-6 border border-gray-400 text-gray-500 bg-white rounded-sm">취소</button>
                <button type="submit" className="text-sm w-10 h-6 border border-gray-400 text-gray-500 bg-white rounded-sm">확인</button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600 pl-1 text-sm">{visitor.content}</p>
          )}
        </div>
      </div>
    </>
  )
}