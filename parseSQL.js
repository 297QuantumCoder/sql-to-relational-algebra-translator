
// Input: SQL Query as a string
export function parseSQL(sqlQuery){
    // Initialize a dictionary to store the parsed components
    var parsedComponents = {
        "queries" : [], // List of Queries with their components
        "setOperations": [] // List of Set Operations
    }

    // Normalizing the SQL Query
    sqlQuery = normalizeSQL(sqlQuery);

    var operations = ["UNION","INTERSECT","MINUS"];
    var checkIfOpPresent = false;
    operations.forEach(op => {
        if(sqlQuery.includes(op))
            checkIfOpPresent = true;
    })

    if(checkIfOpPresent){
        // Split the SQL query into individual queries based on set operations
        var queries = splitBySetOperations(sqlQuery);

        // Process each query part
        var queryComponents;
        queries.forEach(query => {
            queryComponents = processQuery(query);
            parsedComponents["queries"].push(queryComponents);
        })
        

        // Identify set operations present in the query
        parsedComponents["setOperations"] = extractSetOperations(sqlQuery);
    }
    else
        parsedComponents["queries"] = processQuery(sqlQuery);


    // Return the final parsed Components
    return parsedComponents;
}




// ---------------------------------- HELPER FUNCTIONS ---------------------------------------


function normalizeSQL(sqlQuery){
    // Convert the SQL query to uppercase and remove the unnecessary whitespace
    sqlQuery = sqlQuery.toUpperCase().trim().replace(/\s+/g, ' ');
    return sqlQuery;
}

function splitBySetOperations(sqlQuery) {
    // Split SQL query by set operations (UNION, INTERSECT, MINUS)
    // Example : "SELECT ... UNION SELECT ..."

    var operations = ["UNION", "INTERSECT", "MINUS"];
    var splitQueries = [];
    var currentQuery = "";
    var level = 0;

    for (let i = 0; i < sqlQuery.length; i++) {
        const char = sqlQuery[i];
        if (char === "(") {
            level += 1;
        } else if (char === ")") {
            level -= 1;
        }

        currentQuery += char;

        if (level === 0) {
            for (const op of operations) {
                if (sqlQuery.slice(i + 1).startsWith(op)) {
                    splitQueries.push(currentQuery.trim());
                    splitQueries.push(op);
                    currentQuery = "";
                    i += op.length;
                    break;
                }
            }
        }
    }

    if (currentQuery.trim().length > 0) {
        splitQueries.push(currentQuery.trim());
    }

    return splitQueries;
}

function processQuery(query){
    // Extract components of a single query
    var components = {
        "selectFields" : [],
        "fromTables" : [],
        "whereConditions": "",
        "joinON": [],
        "joinConditions": "",
        "renameMapping": {}
        
    }

    // Extract the SELECT clause
    var selectClause = extractClause(query, "SELECT", "FROM");
    components["selectFields"] = extractFields(selectClause);
    
    // console.log(components["selectFields"]);
    // console.log(selectClause);


    // Extract the FROM clause
    var nestedQueries;
    var fromClause = extractClause(query, "FROM", ["WHERE", "JOIN", "UNION", "INTERSECT", "MINUS", ";"]);
    var stringClause = fromClause.join('');
    
    [components["fromTables"], components["renameMapping"]] = extractTablesAndAliases(stringClause);
    

    // Extract the WHERE Clause (if present)
    if(query.includes("WHERE")){
        var whereClause = extractClause(query, "WHERE", ["JOIN", "UNION", "INTERSECT", "MINUS", ";"]);
        components["whereConditions"] = whereClause;
    }

    // Extract the JOIN Conditions (if present)
    if(query.includes("JOIN")){
        var joinClause = extractClause(query, "JOIN", ["ON"]);
        var joinCondition = extractClause(query, "ON", ["WHERE", "UNION", "INTERSECT", "MINUS", ";"]);
        components["joinConditions"] = joinCondition;
        components["joinON"] = joinClause;
    }

    return components;

}


function extractClause(query, startKeyword, endKeyword){
    // Extracts the portion of the query between startKeyword and endKeyword
    // endKeyword can be a single string or a list of possible end keywords
    var startIndex = query.indexOf(startKeyword) + startKeyword.length;
    var endIndex;

    if(Array.isArray(endKeyword)){
        var index = [];
        endKeyword.forEach((kw) =>{
            if(query.indexOf(kw) != -1)
                index.push(query.indexOf(kw));
        })
        endIndex = Math.min(...index);
    }
    else 
        endIndex = query.indexOf(endKeyword);

    var clause = query.slice(startIndex, endIndex).trim();
    
    return [clause];
}


function extractFields(selectClause){
    // Extracts the fields listed in the SELECT Clause
    // Example : "SELECT A, B, C" -> ["A","B","C"]
    var fields = selectClause.map(function(element){
        return element.trim();
    });
    return fields;
}

function extractTablesAndAliases(fromClause){
    // Extracts the tables and any aliases used in the FROM clause
    // Handles nested queries within the FROM clause
    // Example: "FROM R1 AS X, (SELECT A FROM R2) AS Y"

    var tables = [];
    var renameMapping = {};
    var clauses = fromClause.split(",");

    clauses.forEach(function(clause){
        var parts = clause.trim().split(" AS ");
        var table = parts[0].trim();
        tables.push(table);
        
        if(parts.length > 1){
            var alias = parts[1].trim();
            renameMapping[table] = alias;
        }
    })
    return [tables, renameMapping];
}


function extractSetOperations(sqlQuery){
    // Extracts set Operations like UNION, INTERSECT, MINUS
    var operations = ["UNION", "INTERSECT", "MINUS"];
    var foundOperations = [];
    operations.forEach(operation => {
        if(sqlQuery.includes(operation))
            foundOperations.push(operation);
    })
    return foundOperations;
}

var sqlQuery = `SELECT Employees.name, Departments.dept_name
FROM Employees
JOIN Departments ON Employees.dept_id = Departments.dept_id;
`;

console.log(parseSQL(sqlQuery));