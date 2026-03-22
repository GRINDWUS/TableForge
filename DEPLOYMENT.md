# Deployment Guide

## Option 1: Vercel + Railway (Recommended)

### Frontend to Vercel
```bash
cd frontend
npm run build
npm install -g vercel
vercel login
vercel deploy --prod
```

### Backend to Railway

1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Create new project
4. Add environment variables:
   - `PORT=5000`
   - `ANTHROPIC_API_KEY=your-key`
   - `DATABASE=/tmp/data.db`

## Option 2: Heroku + Netlify

### Frontend to Netlify
```bash
cd frontend
npm run build
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Backend to Heroku
```bash
cd backend
heroku login
heroku create tableforge-api
heroku config:set ANTHROPIC_API_KEY=your-key
git push heroku main
```

## Environment Variables

### Production (.env)
```
PORT=5000
NODE_ENV=production
ANTHROPIC_API_KEY=sk-ant-your-key
DATABASE=postgresql://user:password@host/db  # Use PostgreSQL for production
```

### Update Frontend API URL

In `frontend/src/App.jsx`, change:
```javascript
const API = axios.create({
  baseURL: 'https://api.yourdomain.com'  // Your production API URL
});
```

## Production Checklist

- [ ] Set all environment variables
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Setup database backups
- [ ] Configure CORS for your domain
- [ ] Test all endpoints
- [ ] Setup monitoring/logging
- [ ] Enable rate limiting
- [ ] Setup CI/CD pipeline
- [ ] Get SSL certificate

---

**Your app is live!** 🚀
