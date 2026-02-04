#!/usr/bin/env node

/**
 * Validate webring.json entries
 * Run: node scripts/validate.js
 */

const fs = require('fs');
const path = require('path');

const WEBRING_PATH = path.join(__dirname, '..', 'data', 'webring.json');

const REQUIRED_FIELDS = ['id', 'name', 'url', 'description', 'owner'];
const URL_PATTERN = /^https?:\/\/.+/;
const ID_PATTERN = /^[a-z0-9-]+$/;

function validateSite(site, index) {
    const errors = [];

    for (const field of REQUIRED_FIELDS) {
        if (!site[field]) {
            errors.push(`Site ${index + 1}: Missing required field "${field}"`);
        }
    }

    if (site.id && !ID_PATTERN.test(site.id)) {
        errors.push(`Site ${index + 1}: ID "${site.id}" must be lowercase alphanumeric with hyphens only`);
    }

    if (site.url && !URL_PATTERN.test(site.url)) {
        errors.push(`Site ${index + 1}: URL "${site.url}" must start with http:// or https://`);
    }

    if (site.url) {
        try {
            new URL(site.url);
        } catch (e) {
            errors.push(`Site ${index + 1}: Invalid URL format "${site.url}"`);
        }
    }

    if (site.description && site.description.length > 200) {
        errors.push(`Site ${index + 1}: Description exceeds 200 characters`);
    }

    return errors;
}

function validateWebring() {
    console.log('🔍 Validating webring.json...\n');

    if (!fs.existsSync(WEBRING_PATH)) {
        console.error('❌ Error: webring.json not found at', WEBRING_PATH);
        process.exit(1);
    }

    let data;
    try {
        const content = fs.readFileSync(WEBRING_PATH, 'utf8');
        data = JSON.parse(content);
    } catch (e) {
        console.error('❌ Error: Invalid JSON format');
        console.error(e.message);
        process.exit(1);
    }

    if (!data.sites || !Array.isArray(data.sites)) {
        console.error('❌ Error: webring.json must have a "sites" array');
        process.exit(1);
    }

    const allErrors = [];
    const ids = new Set();
    const urls = new Set();

    data.sites.forEach((site, index) => {
        const errors = validateSite(site, index);
        allErrors.push(...errors);

        if (site.id) {
            if (ids.has(site.id)) {
                allErrors.push(`Site ${index + 1}: Duplicate ID "${site.id}"`);
            }
            ids.add(site.id);
        }

        if (site.url) {
            const normalizedUrl = site.url.replace(/\/$/, '');
            if (urls.has(normalizedUrl)) {
                allErrors.push(`Site ${index + 1}: Duplicate URL "${site.url}"`);
            }
            urls.add(normalizedUrl);
        }
    });

    if (allErrors.length > 0) {
        console.error('❌ Validation failed:\n');
        allErrors.forEach(err => console.error(`  • ${err}`));
        console.error(`\n${allErrors.length} error(s) found.`);
        process.exit(1);
    }

    console.log(`✅ All ${data.sites.length} sites validated successfully!`);
}

validateWebring();
