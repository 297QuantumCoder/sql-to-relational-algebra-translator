
# SQL to Relational Algebra Translator

This project is a SQL Translator that converts SQL queries into their corresponding relational algebra expressions. The translator supports basic SQL operations like `SELECT`, `FROM`, `WHERE`, `JOIN`, and set operations such as `UNION`, `INTERSECT`, and `MINUS`.

## Features

- **SQL Parsing**: The translator parses SQL queries to extract different components such as SELECT fields, FROM tables, WHERE conditions, JOIN conditions, etc.
- **Relational Algebra Generation**: Converts parsed SQL components into equivalent relational algebra expressions.
- **Set Operations**: Handles set operations like `UNION`, `INTERSECT`, and `MINUS`.

## How It Works

The translation process is divided into the following steps:

1. **Parsing SQL**: The SQL query is first normalized, split based on set operations if present, and then each query is parsed to extract components such as SELECT fields, FROM tables, WHERE conditions, and JOIN conditions.

2. **Generating Relational Algebra**: The parsed components are then converted into relational algebra expressions, including selection (`σ`), projection (`π`), renaming (`ρ`), and join (`⋈`) operations.

## Project Structure

- **main.js**: The core file that handles the conversion of SQL queries to relational algebra expressions.
- **parseSQL.js**: Contains the functions to parse the SQL query into its components.

## Example

### SQL Query

```sql
SELECT A, B 
FROM R1 AS X, R2 
WHERE X.X1 = R2.Y1 AND A > 10 
UNION 
SELECT A, B 
FROM R1 AS X, R2 
WHERE X.X1 = R2.Y1 AND A > 10;
```

### Equivalent Relational Algebra

```bash
[
    "ρ(X, R1) σ(X.X1 = R2.Y1 AND A > 10) π(A, B)(R1 ⋈ R2)",
    "ρ(X, R1) σ(X.X1 = R2.Y1 AND A > 10) π(A, B)(R1 ⋈ R2)"
]
```


## Future Improvements

- **Expand SQL Support**: Extend the support to more complex SQL queries including nested queries and advanced SQL functions.
- **Error Handling**: Improve error handling and provide more descriptive messages for invalid SQL queries.
- **Optimization**: Implement optimization techniques for relational algebra expressions.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you'd like to contribute.
