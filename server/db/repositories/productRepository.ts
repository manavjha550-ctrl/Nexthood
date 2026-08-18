import { db } from '../client.js';
import { products, productImages, productVariants, categories, collections } from '../schema.js';
import { eq, inArray, desc } from 'drizzle-orm';

export async function getProducts(admin = false) {
  let query = db.select({
    id: products.id,
    slug: products.slug,
    name: products.name,
    sku: products.sku,
    description: products.description,
    price: products.price,
    compareAtPrice: products.compareAtPrice,
    category: categories.name,
    collection: collections.name,
    stock: products.stock,
    featured: products.featured,
    newArrival: products.newArrival,
    bestseller: products.bestseller,
    status: products.status
  }).from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .leftJoin(collections, eq(products.collectionId, collections.id))
  .orderBy(desc(products.createdAt));

  let results = await query;
  
  if (!admin) {
    results = results.filter(p => p.status === 'ACTIVE');
  }

  if (results.length === 0) return [];

  const pIds = results.map(p => p.id);
  const images = await db.select().from(productImages).where(inArray(productImages.productId, pIds)).orderBy(productImages.sortOrder);
  const variants = await db.select().from(productVariants).where(inArray(productVariants.productId, pIds));

  return results.map(p => {
    const pImages = images.filter(img => img.productId === p.id);
    const primaryImg = pImages.find(img => img.isPrimary) || pImages[0];
    const pVariants = variants.filter(v => v.productId === p.id);
    const sizes = [...new Set(pVariants.filter(v => v.size).map(v => v.size))];
    const colors = [...new Set(pVariants.filter(v => v.color).map(v => v.color))];

    return {
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
      primaryImage: primaryImg?.imageUrl || '',
      images: pImages.map(img => ({ src: img.imageUrl, alt: p.name })),
      sizes: sizes.length > 0 ? sizes : undefined,
      colors: colors.length > 0 ? colors : undefined
    };
  });
}

export async function getProductBySlug(slug: string, admin = false) {
  let query = db.select({
    id: products.id,
    slug: products.slug,
    name: products.name,
    sku: products.sku,
    description: products.description,
    price: products.price,
    compareAtPrice: products.compareAtPrice,
    category: categories.name,
    collection: collections.name,
    stock: products.stock,
    featured: products.featured,
    newArrival: products.newArrival,
    bestseller: products.bestseller,
    status: products.status
  }).from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .leftJoin(collections, eq(products.collectionId, collections.id))
  .where(eq(products.slug, slug));

  let results = await query;
  
  if (!admin) {
    results = results.filter(p => p.status === 'ACTIVE');
  }

  if (results.length === 0) return null;
  const p = results[0];

  const images = await db.select().from(productImages).where(eq(productImages.productId, p.id)).orderBy(productImages.sortOrder);
  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, p.id));

  const primaryImg = images.find(img => img.isPrimary) || images[0];
  const sizes = [...new Set(variants.filter(v => v.size).map(v => v.size))];
  const colors = [...new Set(variants.filter(v => v.color).map(v => v.color))];

  return {
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
    primaryImage: primaryImg?.imageUrl || '',
    images: images.map(img => ({ src: img.imageUrl, alt: p.name })),
    sizes: sizes.length > 0 ? sizes : undefined,
    colors: colors.length > 0 ? colors : undefined
  };
}

export async function createProduct(data: any) {
  const category = data.categoryId || (data.category ? (await db.select({ id: categories.id }).from(categories).where(eq(categories.name, data.category)))[0]?.id : null);
  const collection = data.collectionId || (data.collection ? (await db.select({ id: collections.id }).from(collections).where(eq(collections.name, data.collection)))[0]?.id : null);
  const result = await db.insert(products).values({
    id: data.id,
    name: String(data.name).trim(),
    slug: String(data.slug).trim().toLowerCase(),
    sku: data.sku || null,
    description: data.description || '',
    categoryId: category,
    collectionId: collection,
    price: String(data.price),
    compareAtPrice: data.compareAtPrice != null && data.compareAtPrice !== '' ? String(data.compareAtPrice) : null,
    stock: Number.isInteger(Number(data.stock)) ? Number(data.stock) : 0,
    status: data.status || 'ACTIVE',
    featured: Boolean(data.featured),
    newArrival: Boolean(data.newArrival),
    bestseller: Boolean(data.bestseller)
  }).returning();

  const productId = result[0].id;
  const images = Array.isArray(data.images) ? data.images : [];
  const imageUrls = images.map((img: any) => typeof img === 'string' ? img : img?.src).filter(Boolean);
  if (imageUrls.length === 0 && data.primaryImage) imageUrls.push(data.primaryImage);
  if (imageUrls.length) {
    await db.insert(productImages).values(imageUrls.map((url: string, i: number) => ({
      productId,
      imageUrl: url,
      sortOrder: i,
      isPrimary: i === 0
    })));
  }

  if (Array.isArray(data.variants)) {
    await db.insert(productVariants).values(
      data.variants.filter((v: any) => v?.size || v?.color).map((v: any) => ({
        productId,
        size: v.size || null,
        color: v.color || null,
        sku: v.sku || null,
        stock: Math.max(0, Number(v.stock || 0))
      }))
    ).onConflictDoNothing();
  }
  return (await getProductBySlug(result[0].slug, true)) || result[0];
}

export async function updateProduct(id: string, data: any) {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = String(data.name).trim();
  if (data.slug !== undefined) updateData.slug = String(data.slug).trim().toLowerCase();
  if (data.sku !== undefined) updateData.sku = data.sku || null;
  if (data.description !== undefined) updateData.description = data.description || '';
  if (data.price !== undefined) updateData.price = String(data.price);
  if (data.compareAtPrice !== undefined || data.compare_at_price !== undefined) {
    const value = data.compareAtPrice ?? data.compare_at_price;
    updateData.compareAtPrice = value === '' || value == null ? null : String(value);
  }
  if (data.stock !== undefined) updateData.stock = Math.max(0, Number(data.stock));
  if (data.status !== undefined) updateData.status = data.status;
  if (data.featured !== undefined) updateData.featured = Boolean(data.featured);
  if (data.newArrival !== undefined) updateData.newArrival = Boolean(data.newArrival);
  if (data.bestseller !== undefined) updateData.bestseller = Boolean(data.bestseller);

  if (data.categoryId !== undefined || data.category !== undefined) {
    const idValue = data.categoryId || null;
    const category = idValue ? { id: idValue } : (data.category ? (await db.select({ id: categories.id }).from(categories).where(eq(categories.name, data.category)))[0] : null);
    updateData.categoryId = category?.id || null;
  }
  if (data.collectionId !== undefined || data.collection !== undefined) {
    const idValue = data.collectionId || null;
    const collection = idValue ? { id: idValue } : (data.collection ? (await db.select({ id: collections.id }).from(collections).where(eq(collections.name, data.collection)))[0] : null);
    updateData.collectionId = collection?.id || null;
  }

  updateData.updatedAt = new Date();
  const result = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
  if (!result[0]) return null;

  if (Array.isArray(data.images)) {
    await db.delete(productImages).where(eq(productImages.productId, id));
    const imageUrls = data.images.map((img: any) => typeof img === 'string' ? img : img?.src).filter(Boolean);
    if (imageUrls.length) {
      await db.insert(productImages).values(imageUrls.map((url: string, i: number) => ({
        productId: id,
        imageUrl: url,
        sortOrder: i,
        isPrimary: i === 0
      })));
    }
  }

  if (Array.isArray(data.variants)) {
    await db.delete(productVariants).where(eq(productVariants.productId, id));
    const variants = data.variants.filter((v: any) => v?.size || v?.color);
    if (variants.length) {
      await db.insert(productVariants).values(variants.map((v: any) => ({
        productId: id,
        size: v.size || null,
        color: v.color || null,
        sku: v.sku || null,
        stock: Math.max(0, Number(v.stock || 0))
      }))).onConflictDoNothing();
    }
  }

  return getProductBySlug(result[0].slug, true);
}

export async function deleteProduct(id: string) {
  await db.update(products).set({ status: 'ARCHIVED', updatedAt: new Date() }).where(eq(products.id, id));
}
