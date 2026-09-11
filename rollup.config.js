import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import gzipPlugin from 'rollup-plugin-gzip';
import { terser } from 'rollup-plugin-terser';

// Create configurations for both production and development builds
export default [
    // Acorn Development Build
    {
        input: './src/bundless.acorn.js',
        output: {
            file: './dist/bundless.acorn.dev.js',
            format: 'esm',
            inlineDynamicImports: true,
        },
        plugins: [
            nodeResolve(),
            replace({
                'window.Bundless.prod': JSON.stringify(false),
                preventAssignment: true
            }),
            gzipPlugin({
                customCompression: content =>
                    require('zlib').brotliCompressSync(Buffer.from(content)),
                fileName: '.br', // Add .br extension for Brotli files
            })
        ]
    }, 
    // Acorn Production Build
    {
        input: './src/bundless.acorn.js',
        output: {
            dir: './dist',
            entryFileNames: 'bundless.acorn.min.js',
            format: 'esm',
        },
        plugins: [
            nodeResolve(),
            replace({
                'window.Bundless.prod': JSON.stringify(true),
                preventAssignment: true
            }),
            terser({ numWorkers: 2 }),
            gzipPlugin({
                customCompression: content =>
                    require('zlib').brotliCompressSync(Buffer.from(content)),
                fileName: '.br', // Add .br extension for Brotli files
            })
        ]
    },
    // Acorn Production Alias Build
    {
        input: './src/bundless.acorn.js',
        output: {
            dir: './dist',
            entryFileNames: 'bundless.acorn.prod.js',
            format: 'esm',
        },
        plugins: [
            nodeResolve(),
            replace({
                'window.Bundless.prod': JSON.stringify(true),
                preventAssignment: true
            }),
            terser({ numWorkers: 2 }),
            gzipPlugin({
                customCompression: content =>
                    require('zlib').brotliCompressSync(Buffer.from(content)),
                fileName: '.br', // Add .br extension for Brotli files
            })
        ]
    },
    // Meriyah Development Build
    {
        input: './src/bundless.meriyah.js',
        output: {
            file: './dist/bundless.meriyah.dev.js',
            format: 'esm',
            inlineDynamicImports: true,
        },
        plugins: [
            nodeResolve(),
            replace({
                'window.Bundless.prod': JSON.stringify(false),
                preventAssignment: true
            }),
            gzipPlugin({
                customCompression: content =>
                    require('zlib').brotliCompressSync(Buffer.from(content)),
                fileName: '.br', // Add .br extension for Brotli files
            })
        ]
    }, 
    // Meriyah Production Build
    {
        input: './src/bundless.meriyah.js',
        output: {
            dir: './dist',
            entryFileNames: 'bundless.meriyah.min.js',
            format: 'esm',
        },
        plugins: [
            nodeResolve(),
            replace({
                'window.Bundless.prod': JSON.stringify(true),
                preventAssignment: true
            }),
            terser({ numWorkers: 2 }),
            gzipPlugin({
                customCompression: content =>
                    require('zlib').brotliCompressSync(Buffer.from(content)),
                fileName: '.br', // Add .br extension for Brotli files
            })
        ]
    },
    // Meriyah Production Alias Build
    {
        input: './src/bundless.meriyah.js',
        output: {
            dir: './dist',
            entryFileNames: 'bundless.meriyah.prod.js',
            format: 'esm',
        },
        plugins: [
            nodeResolve(),
            replace({
                'window.Bundless.prod': JSON.stringify(true),
                preventAssignment: true
            }),
            terser({ numWorkers: 2 }),
            gzipPlugin({
                customCompression: content =>
                    require('zlib').brotliCompressSync(Buffer.from(content)),
                fileName: '.br', // Add .br extension for Brotli files
            })
        ]
    },
    // Babel Build
    {
        input: './src/bundless.babel.js',
        output: {
            file: './dist/bundless.babel.min.js',
            format: 'esm',
        },
        plugins: [
            nodeResolve(),
            gzipPlugin({
                customCompression: content =>
                    require('zlib').brotliCompressSync(Buffer.from(content)),
                fileName: '.br', // Add .br extension for Brotli files
            })
        ]
    }, 
    // Sucrase Build
    {
        input: './src/bundless.sucrase.js',
        output: {
            file: './dist/bundless.sucrase.min.js',
            format: 'esm',
        },
        plugins: [
            nodeResolve(),
            terser({ numWorkers: 2 }),
            gzipPlugin({
                customCompression: content =>
                    require('zlib').brotliCompressSync(Buffer.from(content)),
                fileName: '.br', // Add .br extension for Brotli files
            })
        ]
    },
];
