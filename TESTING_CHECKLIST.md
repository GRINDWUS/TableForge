# TableForge Testing Checklist

## Backend Tests
- [ ] Server starts without errors
- [ ] GET /api/health returns status
- [ ] GET /api/tables lists all tables
- [ ] GET /api/tables/:name/schema shows columns
- [ ] GET /api/tables/:name/data returns rows
- [ ] POST /api/tables/:name/rows adds new row
- [ ] PUT /api/tables/:name/rows/:id updates row
- [ ] DELETE /api/tables/:name/rows/:id deletes row
- [ ] Filter query works (?filter=...)
- [ ] Sort query works (?sort=...)
- [ ] AI endpoint works (with ANTHROPIC_API_KEY set)

## Frontend Tests
- [ ] Home page loads
- [ ] Table selector shows all tables
- [ ] Can click table and see data
- [ ] Grid displays all columns
- [ ] Can add new row
- [ ] Can edit row in grid
- [ ] Can delete row
- [ ] View Schema button works
- [ ] Filter & Sort button works
- [ ] Relationships button works
- [ ] AI Helper button works
- [ ] Export to CSV button works
- [ ] Dark mode toggle works
- [ ] Dark mode persists on reload
- [ ] All keyboard shortcuts work (Ctrl+E, Ctrl+A, Ctrl+F, Ctrl+R)

## UI/UX Tests
- [ ] No console errors
- [ ] No network errors
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] All buttons have hover states
- [ ] Loading states show
- [ ] Error messages display
- [ ] Dark mode applies to all elements
- [ ] Forms are properly styled

## Performance Tests
- [ ] Page loads in <3 seconds
- [ ] Grid scrolls smoothly
- [ ] Adding row is fast
- [ ] Filter/Sort responds quickly
- [ ] No memory leaks

## Browser Tests
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
