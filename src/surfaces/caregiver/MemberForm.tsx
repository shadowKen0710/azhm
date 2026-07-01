import { useEffect, useRef, useState } from "react"
import { Camera, Trash2, X } from "lucide-react"

import { FamilyAvatar } from "@/components/FamilyAvatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useFamily, type FamilyInput } from "@/state/family"
import type { FamilyMember, FamilyTone } from "@/services/family"

const TONES: { tone: FamilyTone; label: string; swatch: string }[] = [
  { tone: "peach", label: "暖橘", swatch: "bg-[#F7C9A0]" },
  { tone: "mint", label: "柔绿", swatch: "bg-[#B9E2C4]" },
  { tone: "sky", label: "天蓝", swatch: "bg-[#ACD3EF]" },
  { tone: "lilac", label: "藕紫", swatch: "bg-[#D6C6F0]" },
]

const MAX_PHOTO_BYTES = 3 * 1024 * 1024

/** 新增/编辑家人表单（编辑传 member，新增传 null）。含头像上传（本地占位）。 */
export function MemberForm({
  member,
  onClose,
}: {
  member: FamilyMember | null
  onClose: () => void
}) {
  const { addMember, updateMember, removeMember } = useFamily()
  const isEdit = !!member
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(member?.name ?? "")
  const [relation, setRelation] = useState(member?.relation ?? "")
  const [nickname, setNickname] = useState(member?.nickname ?? "")
  const [tone, setTone] = useState<FamilyTone>(member?.tone ?? "peach")
  const [photo, setPhoto] = useState<string | undefined>(member?.photo)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const previewInitial = name.trim() ? name.trim().slice(-1) : "亲"

  function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件。")
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("图片太大，请选小于 3MB 的照片。")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(reader.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  function submit() {
    if (!name.trim() || !relation.trim()) {
      setError("请填写姓名和关系。")
      return
    }
    const input: FamilyInput = {
      name: name.trim(),
      relation: relation.trim(),
      nickname: nickname.trim() || name.trim(),
      tone,
      photo,
    }
    if (isEdit && member) updateMember(member.id, input)
    else addMember(input)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-[32px] bg-card p-6 shadow-phone"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-ink">
            {isEdit ? "编辑家人" : "添加家人"}
          </h2>
          <button
            aria-label="关闭"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 头像上传 */}
        <div className="mt-5 flex flex-col items-center">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative"
            aria-label="上传照片"
          >
            <FamilyAvatar
              photo={photo}
              initial={previewInitial}
              tone={tone}
              className="h-24 w-24 text-4xl"
            />
            <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-ink text-cream shadow-soft">
              <Camera className="h-4 w-4" />
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pickPhoto}
          />
          {photo && (
            <button
              onClick={() => setPhoto(undefined)}
              className="mt-2 text-xs font-semibold text-muted-foreground underline"
            >
              移除照片
            </button>
          )}
        </div>

        {/* 姓名 / 关系 / 称呼 */}
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-ink">姓名</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：小雯"
              className="mt-2"
              autoFocus
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">关系</p>
            <Input
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="如：女儿"
              className="mt-2"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              称呼 <span className="font-normal text-muted-foreground">（患者怎么叫 TA）</span>
            </p>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="如：之之"
              className="mt-2"
            />
          </div>
        </div>

        {/* 无照片时的头像底色 */}
        {!photo && (
          <>
            <p className="mt-4 text-sm font-semibold text-ink">头像底色</p>
            <div className="mt-2 flex gap-3">
              {TONES.map((t) => (
                <button
                  key={t.tone}
                  aria-label={t.label}
                  onClick={() => setTone(t.tone)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-transform",
                    t.swatch,
                    tone === t.tone
                      ? "ring-2 ring-ink ring-offset-2 ring-offset-card"
                      : "hover:scale-105"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {error && (
          <p className="mt-4 text-sm font-semibold text-destructive">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          {isEdit &&
            (confirmDelete ? (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  if (member) removeMember(member.id)
                  onClose()
                }}
              >
                确认删除
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                aria-label="删除"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            ))}
          <Button className="flex-1" onClick={submit}>
            {isEdit ? "保存修改" : "添加家人"}
          </Button>
        </div>
      </div>
    </div>
  )
}
