echo postgresql://neondb_owner:npg_UY4HPSE2JoAq@ep-dark-dawn-ap3voejd-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require | vercel env add DATABASE_URL production --token (vercel whoami --token)
echo postgresql://neondb_owner:npg_UY4HPSE2JoAq@ep-dark-dawn-ap3voejd.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require | vercel env add DIRECT_DATABASE_URL production --token (vercel whoami --token)
echo oaZdjPXrbash7SuceatxnS+mZvw0DrqPhQ7TiDe95fM= | vercel env add AUTH_SECRET production --token (vercel whoami --token)
echo RoVFwM0PSuY2g51xTM7mWGDeo2FMHvtktpkF+/LEz7I= | vercel env add ENCRYPTION_KEY production --token (vercel whoami --token)
