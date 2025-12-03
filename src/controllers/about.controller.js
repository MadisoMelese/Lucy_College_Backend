import { AboutService } from "../services/about.service.js";

export const AboutController = {
  async get(req, res) {
    const about = await AboutService.getAbout();
    res.status(200).json(about);
  },

  async create(req, res) {
    const about = await AboutService.createAbout(req.body);
    res.status(201).json({
      message: "About section created successfully",
      data: about
    });
  },

  async update(req, res) {
    const { id } = req.params;
    const about = await AboutService.updateAbout(Number(id), req.body);

    res.status(200).json({
      message: "About section updated successfully",
      data: about
    });
  },

  async delete(req, res) {
    const { id } = req.params;
    await AboutService.deleteAbout(Number(id));

    res.status(200).json({
      message: "About section deleted successfully"
    });
  }
};
