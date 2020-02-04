import File from '../models/File';

// Controller de Arquivos
class FileController {
  // Cadastra nome e caminho referente ao arquivo armazenado na pasta tmp
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path
    });

    return res.json(file);
  }
}

export default new FileController();
