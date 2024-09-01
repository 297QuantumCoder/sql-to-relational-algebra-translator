import { parseSQL } from "./parseSQL.js"


// Input: SQl query as a string

function convertSQLtoRelationalAlgebra(sqlQuery){
    // Step 1: Parse the SQL query to extract the components(SELECT, FROM, WHERE, etc)
    var parsedQuery = parseSQL(sqlQuery);
    
    // Step 2: Initialize an empty relational algebra expression
    var relationalAlgebraArray = [];

    // Step 3: Handle different SQL components
    
    parsedQuery["queries"].forEach((query) => {
        var relationalAlgebra = "";

        // Rename operation (if any table alias is used in the FROM clause)
        if(Object.keys(query["renameMapping"]).length != 0){
            var renameMapping = query.renameMapping;
            relationalAlgebra += renameTables(renameMapping);
        }

        // Selection Operation (WHERE Clause)
        if(query["whereConditions"].length > 0){
            var selectionCondition = query["whereConditions"];
            relationalAlgebra += "σ(" + selectionCondition + ")";
        }

        // Projection Operation (SELECT Clause)
        var projectionFields = query["selectFields"];
        if(projectionFields != "*"){ // If not selecting all fields
            relationalAlgebra += "π(" + projectionFields + ")";
        }

        // FROM Clause(Tables) and JOIN operation (if present) 
        relationalAlgebra += "(" + joinTables(query) + ")";

        relationalAlgebraArray.push(relationalAlgebra);
    });

    // Union, Intersection, Minus operations (if there are set operations)
    if(parsedQuery["setOperations"].length > 0){ // Set Operation Present

    }

    return relationalAlgebraArray;
}






// ------------------------ HELPER FUNCTIONS -------------------------------
function renameTables(renameMapping){
    // Applying renaming to tables as specified in the SQL query
    // Example: if R1 as X, return ρ(X, R1)

    var renamingExpression = "";
    for(let table in renameMapping){
        let alias = renameMapping[table];
        renamingExpression += "ρ(" + alias + ", " + table + ") ";
    }
    return renamingExpression;
}


function joinTables(query){
    if(query["joinON"].length > 0){ // Join Present
        
        if(query["joinConditions"].length > 0){ // Join Condition Present
            return query["fromTables"] + " ⋈_{" + query["joinConditions"] + "} " + query["joinON"];
        }
        else {
            return query["fromTables"] + " ⋈ " + query["joinON"];
        }
    }
    else // No Join Present
        return query["fromTables"].join(" × ");
}










// # Example usage:
var sqlQuery = "SELECT A, B FROM R1 AS X, R2 WHERE X.X1 = R2.Y1 AND A > 10 UNION SELECT A, B FROM R1 AS X, R2 WHERE X.X1 = R2.Y1 AND A > 10";
console.log(convertSQLtoRelationalAlgebra(sqlQuery));