import Template from '../models/Template.js';
import { asyncHandler, HttpError, pick } from '../utils/http.js';

const FIELDS = ['title', 'summary', 'location', 'durationDays', 'tags', 'days', 'isPublished'];

// Public listing shows only published templates; admins can pass ?all=true.
export const listTemplates = asyncHandler(async (req, res) => {
  const filter = {};
  const isAdmin = req.user?.role === 'admin';
  if (!(isAdmin && req.query.all === 'true')) filter.isPublished = true;
  if (req.query.location) filter.location = req.query.location;
  if (req.query.tag) filter.tags = req.query.tag;

  const templates = await Template.find(filter)
    .populate('location', 'name city country imageUrl category')
    .sort({ timesUsed: -1, createdAt: -1 });
  res.json(templates);
});

export const getTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id).populate('location');
  if (!template || (!template.isPublished && req.user?.role !== 'admin')) {
    throw new HttpError(404, 'Template not found');
  }
  res.json(template);
});

export const createTemplate = asyncHandler(async (req, res) => {
  const template = await Template.create({ ...pick(req.body, FIELDS), createdBy: req.user._id });
  res.status(201).json(await template.populate('location', 'name city country imageUrl category'));
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id);
  if (!template) throw new HttpError(404, 'Template not found');
  template.set(pick(req.body, FIELDS));
  await template.save();
  res.json(await template.populate('location', 'name city country imageUrl category'));
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findByIdAndDelete(req.params.id);
  if (!template) throw new HttpError(404, 'Template not found');
  res.json({ message: 'Template deleted' });
});
