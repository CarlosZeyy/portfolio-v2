import { addProject } from "@/app/admin/actions";

const addProjectPage = () => {
  return (
    <div className="flex">
      <h1>Adicionar Projeto</h1>

      <div className="flex">
        <form action={addProject} className="flex flex-col">
          <label>Titulo do projeto:</label>
          <input type="text" name="title" />

          <label>Descrição do projeto:</label>
          <input type="text" name="description" />

          <label>Thumbnail do projeto:</label>
          <input type="text" name="thumbnail_url" />

          <label>Stacks do projeto:</label>
          <input type="text" name="stacks" />

          <label>Repositório do projeto:</label>
          <input type="text" name="repo_url" />
          <button type="submit" className="cursor-pointer">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default addProjectPage;
