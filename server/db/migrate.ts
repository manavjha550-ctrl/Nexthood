import { db } from './client.js';
import crypto from 'crypto';
import { catalog } from '../../src/data/products.js';
import { categories, collections, products, productImages, productVariants, users, coupons, storeSettings } from './schema.js';
import { eq } from 'drizzle-orm';
import { execSync } from 'child_process';

export async function runMigrations() {
  try {
    console.log('Running drizzle-kit push...');
    execSync('npx drizzle-kit push', { stdio: 'inherit' });

    console.log('Starting seed...');

    // Seed categories
    const catData = [
      { id: 'c1', name: 'T-Shirts', slug: 't-shirts' },
      { id: 'c2', name: 'Long Sleeve', slug: 'long-sleeve' }
    ];
    for (const c of catData) {
      await db.insert(categories).values(c).onConflictDoNothing({ target: categories.slug });
    }

    // Seed collections
    const colData = [
      { id: 'col1', name: 'Graphic Series', slug: 'graphic-series' }
    ];
    for (const c of colData) {
      await db.insert(collections).values(c).onConflictDoNothing({ target: collections.slug });
    }

    // Seed Products
    for (const p of catalog) {
      const catRes = await db.select({ id: categories.id }).from(categories).where(eq(categories.name, p.category || 'T-Shirts'));
      const catId = catRes.length > 0 ? catRes[0].id : 'c1';

      const colRes = await db.select({ id: collections.id }).from(collections).where(eq(collections.name, p.collection || 'Graphic Series'));
      const colId = colRes.length > 0 ? colRes[0].id : 'col1';

      await db.insert(products).values({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || `SKU-${p.id.toUpperCase()}`,
        description: p.description || '',
        categoryId: catId,
        collectionId: colId,
        price: String(p.price),
        compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : null,
        stock: p.stock || 100,
        featured: p.featured || false,
        newArrival: p.newArrival || false,
        bestseller: p.bestseller || false
      }).onConflictDoNothing({ target: products.slug });

      // Seed Product Images
      if (p.primaryImage) {
        const exist = await db.select().from(productImages).where(eq(productImages.productId, p.id));
        if (!exist.find(img => img.isPrimary)) {
          await db.insert(productImages).values({
            productId: p.id,
            imageUrl: p.primaryImage,
            sortOrder: 0,
            isPrimary: true
          });
        }
      }

      if (p.images && p.images.length > 0) {
        const exist = await db.select().from(productImages).where(eq(productImages.productId, p.id));
        for (let i = 0; i < p.images.length; i++) {
          const img = p.images[i];
          if (img.src !== p.primaryImage && !exist.find(e => e.imageUrl === img.src)) {
             await db.insert(productImages).values({
               productId: p.id,
               imageUrl: img.src,
               sortOrder: i + 1,
               isPrimary: false
             });
          }
        }
      }

      // Seed Product Variants
      if (p.sizes && p.colors) {
        for (const size of p.sizes) {
          for (const color of p.colors) {
            const vSku = `SKU-${p.id.toUpperCase()}-${size.toUpperCase().replace(/\s/g, '')}-${color.toUpperCase().replace(/\s/g, '')}`;
            await db.insert(productVariants).values({
              productId: p.id,
              size,
              color,
              sku: vSku,
              stock: 50
            }).onConflictDoNothing({ target: productVariants.sku });
          }
        }
      } else if (p.sizes) {
        for (const size of p.sizes) {
           const vSku = `SKU-${p.id.toUpperCase()}-${size.toUpperCase().replace(/\s/g, '')}`;
           await db.insert(productVariants).values({
             productId: p.id,
             size,
             color: null,
             sku: vSku,
             stock: 50
           }).onConflictDoNothing({ target: productVariants.sku });
        }
      }
    }

    // Demo users are explicitly opt-in and never created by a production
    // startup. This avoids shipping known credentials in application code.
    if (process.env.SEED_DEMO_USERS === 'true') {
      const demoAdminEmail = process.env.DEMO_ADMIN_EMAIL;
      const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD;

      if (demoAdminEmail && demoAdminPassword) {
        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.scryptSync(demoAdminPassword, salt, 64).toString('hex');
        await db.insert(users).values({
          fullName: process.env.DEMO_ADMIN_NAME || 'Development Admin',
          email: demoAdminEmail,
          passwordHash,
          salt,
          role: 'ADMIN'
        }).onConflictDoNothing({ target: users.email });
      }
    }

    // Seed Coupons
    const couponData = [
      { code: 'NEXTHOOD10', type: 'PERCENTAGE', value: '10', minOrder: '0' },
      { code: 'STUDIO15', type: 'PERCENTAGE', value: '15', minOrder: '2000' },
      { code: 'WELCOME20', type: 'PERCENTAGE', value: '20', minOrder: '0' },
      { code: 'FREESHIP', type: 'FREE_SHIPPING', value: '0', minOrder: '0' }
    ];
    for (const c of couponData) {
      await db.insert(coupons).values({
        code: c.code,
        type: c.type,
        value: c.value,
        minOrder: c.minOrder
      }).onConflictDoNothing({ target: coupons.code });
    }

    // Seed Settings
    await db.insert(storeSettings).values({
      id: 'global',
      storeName: 'NEXTHOOD STUDIO',
      supportEmail: 'support@nexthood.com',
      legalName: 'NEXTHOOD LLC',
      country: 'IN',
      processingTime: '1-2 business days',
      deliveryEstimate: '3-5 business days',
      announcementText: 'FREE SHIPPING ON ALL ORDERS'
    }).onConflictDoNothing({ target: storeSettings.id });

    console.log('Database migration and seeding completed successfully.');
  } catch (e) {
    console.error('Migration failed', e);
    throw e;
  }
}
