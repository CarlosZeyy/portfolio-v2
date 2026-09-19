/**
 * Estado que addProject/updateProject devolvem ao useActionState. Fica fora do
 * actions.ts porque arquivo "use server" só pode exportar funções assíncronas.
 */
export interface ProjectFormState {
  /** Mensagem geral (erro de upload, de banco...). */
  error?: string;
  /** Erros de validação, por nome de campo do formulário. */
  fieldErrors?: Record<string, string>;
}

export const initialProjectFormState: ProjectFormState = {};
