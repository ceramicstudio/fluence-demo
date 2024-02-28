# EthDenver Scavenger Hunt App

Private repository for our EthDenver2024 Scavenger Hunt application.

## Getting Started 

1. Install your dependencies:

```bash
npm install
```

2. Duplicate the existing .env.example file and rename it `.env`

3. Create a secret key:

```bash
npm run createKey
```

Take the logged string output from your and assign it to the `SECRET_KEY` value in your .env file

4. Assign a live PostgreSQL connection string to your `STRING` value in your .env file

5. Run the application in developer mode:

```bash
npm run dev
```

6. Uncomment the code found in /src/pages/api/table.ts and prime your PostgreSQL database by making a fetch request to `http://localhost:3000/api/table`

7. Once complete, you are ready to use the application
