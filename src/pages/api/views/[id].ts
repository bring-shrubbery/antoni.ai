import type { APIContext } from "astro";
import { prisma } from "lib/prisma";

// For deserializing BigInt into JSON
// @ts-ignore
BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

export interface Stats {
  count?: number;
  slug?: string;
}

export async function post({ request, params }: APIContext) {
  const { id } = params;
  const slug = id?.toString();

  if (!slug)
    return new Response("400: Bad Request. No slug provided.", { status: 400 });

  const data = await prisma.viewCounter.upsert({
    where: { slug },
    create: { slug, count: 0 },
    update: {
      count: {
        increment: 1,
      },
    },
  });

  return new Response(
    JSON.stringify({
      slug: data.slug,
      count: data.count,
    }),
    { status: 200 }
  );
}

export async function get({ request, params }: APIContext) {
  const { id } = params;
  const slug = id?.toString();

  if (!slug)
    return new Response("400: Bad Request. No slug provided.", { status: 400 });

  const data = await prisma.viewCounter.findUnique({
    where: {
      slug,
    },
  });

  if (!data) return new Response("404: Not Found", { status: 404 });

  return new Response(
    JSON.stringify({
      slug: data.slug,
      count: data.count,
    }),
    {
      status: 200,
    }
  );
}
