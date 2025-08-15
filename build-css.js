#!/usr/bin/env node

import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import fs from 'fs/promises'

async function buildCSS() {
  try {
    console.log('Building optimized Tailwind CSS...')
    console.log('Current working directory:', process.cwd())
    
    // Read input CSS
    const inputCSS = await fs.readFile('./css/input.css', 'utf8')
    console.log('Input CSS length:', inputCSS.length)
    
    // Create PostCSS processor with plugins
    const processor = postcss([
      tailwindcss(),
      autoprefixer()
    ])
    
    // Process CSS
    const result = await processor.process(inputCSS, {
      from: './css/input.css',
      to: './css/styles.css'
    })
    
    // Ensure css directory exists
    await fs.mkdir('./css', { recursive: true })
    
    // Write output
    await fs.writeFile('./css/styles.css', result.css)
    
    if (result.map) {
      await fs.writeFile('./css/styles.css.map', result.map.toString())
    }
    
    console.log('✅ CSS built successfully!')
    console.log(`📦 Output: ./css/styles.css`)
    
    // Get file size
    const stats = await fs.stat('./css/styles.css')
    const sizeKB = (stats.size / 1024).toFixed(2)
    console.log(`📏 Size: ${sizeKB}KB`)
    
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

buildCSS()