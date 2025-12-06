#!/usr/bin/env node

import * as esbuild from 'esbuild';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function buildCSS() {
  console.log('Building CMS styles...');
  
  const inputCSS = await readFile(join(__dirname, 'client/styles.css'), 'utf-8');
  
  const result = await postcss([
    tailwindcss(),
    autoprefixer
  ]).process(inputCSS, {
    from: join(__dirname, 'client/styles.css'),
    to: join(__dirname, 'static/bundle.css')
  });
  
  await mkdir(join(__dirname, 'static'), { recursive: true });
  await writeFile(join(__dirname, 'static/bundle.css'), result.css);
  
  console.log('✓ CMS styles built');
}

async function buildJS() {
  console.log('Building CMS client bundle...');
  
  await esbuild.build({
    entryPoints: [join(__dirname, 'client/index.tsx')],
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV !== 'production',
    outfile: join(__dirname, 'static/bundle.js'),
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    jsx: 'automatic',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    },
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.css': 'empty' // Ignore CSS imports in JS
    }
  });
  
  console.log('✓ CMS client bundle built');
}

async function build() {
  try {
    await Promise.all([buildCSS(), buildJS()]);
    console.log('✓ CMS build complete');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
