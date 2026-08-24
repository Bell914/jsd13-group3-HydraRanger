import { Item } from '../models/Item.js';
import { initialItems } from '../data/seedData.json' with { type: 'json' };

// In-Memory store initialized with seed items
let inMemoryItems = [...initialItems];

export const getItems = async ({ page = 1, limit = 10, category, status, search }) => {
  try {
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  } catch (error) {
    // In-memory fallback
    let filtered = [...inMemoryItems];

    if (category) {
      filtered = filtered.filter((item) => item.category === category);
    }
    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
      );
    }

    const total = filtered.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedItems = filtered.slice(startIndex, startIndex + Number(limit));

    return {
      items: paginatedItems,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    };
  }
};

export const getItemById = async (id) => {
  try {
    const item = await Item.findById(id);
    if (item) return item;
  } catch {
    // continue to fallback
  }

  const found = inMemoryItems.find((i) => i.id === id || i._id === id);
  if (!found) {
    throw new Error('Item not found');
  }
  return found;
};

export const createItem = async (itemData, user) => {
  try {
    const newItem = await Item.create({
      ...itemData,
      createdBy: user?.id || null,
      creatorName: user?.username || 'Hydra Member'
    });
    return newItem;
  } catch (error) {
    const newItem = {
      id: `item-${Date.now()}`,
      _id: `item-${Date.now()}`,
      ...itemData,
      createdBy: user?.id || 'guest',
      creatorName: user?.username || 'Hydra Member',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryItems.unshift(newItem);
    return newItem;
  }
};

export const updateItem = async (id, updateData) => {
  try {
    const updated = await Item.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (updated) return updated;
  } catch {
    // fallback
  }

  const index = inMemoryItems.findIndex((i) => i.id === id || i._id === id);
  if (index === -1) {
    throw new Error('Item not found');
  }

  inMemoryItems[index] = {
    ...inMemoryItems[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  return inMemoryItems[index];
};

export const deleteItem = async (id) => {
  try {
    const deleted = await Item.findByIdAndDelete(id);
    if (deleted) return { success: true };
  } catch {
    // fallback
  }

  const initialLen = inMemoryItems.length;
  inMemoryItems = inMemoryItems.filter((i) => i.id !== id && i._id !== id);
  if (inMemoryItems.length === initialLen) {
    throw new Error('Item not found');
  }
  return { success: true };
};
