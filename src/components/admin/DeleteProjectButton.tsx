"use client";

import { useTransition } from "react";
import { LuTrash2 } from "react-icons/lu";
import { deleteProject } from "@/app/(admin)/admin/actions";
import { ConfirmButton } from "./ConfirmButton";

export function DeleteProjectButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <ConfirmButton
      pending={pending}
      icon={<LuTrash2 />}
      label="Excluir"
      confirmLabel="Excluir mesmo?"
      className="flex-1"
      onConfirm={() =>
        startTransition(async () => {
          const formData = new FormData();
          formData.set("id", id);
          await deleteProject(formData);
        })
      }
    />
  );
}
