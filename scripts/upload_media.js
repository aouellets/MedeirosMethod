import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = 'https://qgxqjqjqjqjqjqjqjqjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFneHFqcWpxanFqcWpxanFqcWpxaiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MTg5MjQwMDAsImV4cCI6MjAzNDUwMDAwMH0.2QYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define media files to upload
const mediaFiles = [
    {
        name: 'justin-training-1.jpg',
        url: 'https://instagram.fyyc4-1.fna.fbcdn.net/v/t51.2885-15/432123456_123456789012345_1234567890123456789_n.jpg'
    },
    {
        name: 'justin-recovery.jpg',
        url: 'https://instagram.fyyc4-1.fna.fbcdn.net/v/t51.2885-15/432123457_123456789012346_1234567890123456790_n.jpg'
    },
    {
        name: 'justin-vlog-thumbnail.jpg',
        url: 'https://i.ytimg.com/vi/1234567890/maxresdefault.jpg'
    },
    {
        name: 'justin-nobull.jpg',
        url: 'https://instagram.fyyc4-1.fna.fbcdn.net/v/t51.2885-15/432123458_123456789012347_1234567890123456791_n.jpg'
    },
    {
        name: 'justin-nutrex.jpg',
        url: 'https://instagram.fyyc4-1.fna.fbcdn.net/v/t51.2885-15/432123459_123456789012348_1234567890123456792_n.jpg'
    }
];

async function downloadAndUploadMedia() {
    console.log('Starting media upload process...');
    
    for (const file of mediaFiles) {
        try {
            console.log(`Processing ${file.name}...`);
            console.log(`Downloading from ${file.url}...`);
            
            // Download the file
            const response = await fetch(file.url);
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.statusText}`);
            }
            
            const buffer = await response.buffer();
            
            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('social-posts')
                .upload(file.name, buffer, {
                    contentType: 'image/jpeg',
                    upsert: true
                });
            
            if (error) {
                throw error;
            }
            
            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('social-posts')
                .getPublicUrl(file.name);
            
            console.log(`Successfully uploaded ${file.name}`);
            console.log(`Public URL: ${publicUrl}`);
            
        } catch (error) {
            console.error(`Error processing ${file.name}:`, error.message);
        }
    }
    
    console.log('Media upload process completed.');
}

// Run the upload process
downloadAndUploadMedia().catch(console.error); 