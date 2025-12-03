import { HeroService } from "../services/hero.service.js";
import { fileUrl } from "../utils/fileUrl.js";

export const HeroController = {
  async getAll(req, res) {
    const items = await HeroService.getAll();
    res.json(items);
  },

  async create(req, res) {
    const data = { ...req.body };

    if (req.file) {
      const url = fileUrl(req, `hero/${req.file.filename}`);
      data.image = url;
      data.imageUrl = url;
    } else if (data.image && !data.imageUrl) {
      // if client provided image but not imageUrl, use image as imageUrl
      data.imageUrl = data.image;
    }

    if (!data.imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    // Prisma model expects `imageUrl` (not `image`). Remove any `image` key
    // so we don't send unknown fields to Prisma and trigger validation errors.
    if (Object.prototype.hasOwnProperty.call(data, "image")) delete data.image;

    const newItem = await HeroService.create(data);
    res.status(201).json(newItem);
  },

  async update(req, res) {
    const { id } = req.params;
    const incoming = { ...req.body };

    if (req.file) {
      const url = fileUrl(req, `hero/${req.file.filename}`);
      incoming.image = url;
      incoming.imageUrl = url;
    } else if (incoming.image && !incoming.imageUrl) {
      incoming.imageUrl = incoming.image;
    }

    // remove undefined keys so Prisma won't try to set them
    Object.keys(incoming).forEach((k) => {
      if (incoming[k] === undefined) delete incoming[k];
    });

    // Prisma model does not have `image` field; ensure it's not sent.
    if (Object.prototype.hasOwnProperty.call(incoming, "image")) delete incoming.image;

    const updated = await HeroService.update(Number(id), incoming);
    res.json(updated);
  },

  async delete(req, res) {
    const { id } = req.params;
    await HeroService.delete(Number(id));
    res.json({ message: "Deleted" });
  },
};
