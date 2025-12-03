import { HeroService } from "../services/hero.service.js";
import { fileUrl } from "../utils/fileUrl.js";

export const HeroController = {
  async getAll(req, res) {
    const items = await HeroService.getAll();
    res.json(items);
  },

  async create(req, res) {
    const data = req.body;

    if (req.file) {
      data.image = fileUrl(req, `hero/${req.file.filename}`);
    }

    const newItem = await HeroService.create(data);
    res.status(201).json(newItem);
  },

  async update(req, res) {
    const { id } = req.params;
    const data = req.body;

    if (req.file) {
      data.image = fileUrl(req, `hero/${req.file.filename}`);
    }

    const updated = await HeroService.update(Number(id), data);
    res.json(updated);
  },


  async delete(req, res) {
    const { id } = req.params;
    await HeroService.delete(Number(id));
    res.json({ message: "Deleted" });
  },
};
