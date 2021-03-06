<?php
/*
The database_config.php file should have the following variables set:
$servername = "localhost";
$port = 3306; // 3306 is standard, but modify if needed.
$username = "username";
$password = "password";
$dbname = "database";
$table = "tablename";
Example JavaScript to write data:
var data = [
  {test1: 1, test2: 2},
  {test1: 2, test2: 4},
  {test1: 3, test2: 6},
  {test1: 4, test2: 8},
];
var xhr = new XMLHttpRequest();
xhr.open('POST', 'write_data.php');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
  if(xhr.status == 200){
    var response = xhr.responseText;
    console.log(response);
  }
};
xhr.send(JSON.stringify(data));
*/
include('database_config.php');
$data_array = json_decode(file_get_contents('php://input'), true);
try {
  $conn = new PDO("mysql:host=$servername;port=$port;dbname=$dbname", $username, $password);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  // First stage is to get all column names from the table and store
  // them in $col_names array.
  $stmt = $conn->prepare("SHOW COLUMNS FROM `$table`");
  $stmt->execute();
  $col_names = array();
  while($row = $stmt->fetchColumn()) {
    $col_names[] = $row;
  }
  // Second stage is to create prepared SQL statement using the column
  // names as a guide to what values might be in the JSON.
  // If a value is missing from a particular trial, then NULL is inserted
  $sql = "INSERT INTO $table VALUES(";
  for($i = 0; $i < count($col_names); $i++){
    $name = $col_names[$i];
    $sql .= ":$name";
    if($i != count($col_names)-1){
      $sql .= ", ";
    }
  }
  $sql .= ");";
  $insertstmt = $conn->prepare($sql);
  for($i=0; $i < count($data_array); $i++){
    for($j = 0; $j < count($col_names); $j++){
      $colname = $col_names[$j];
      if(!isset($data_array[$i][$colname])){
        $insertstmt->bindValue(":$colname", null, PDO::PARAM_NULL);
      } else {
        $insertstmt->bindValue(":$colname", $data_array[$i][$colname]);
      }
    }

    $insertstmt->execute();
  }
  echo '{"success": true}';
} catch(PDOException $e) {
  echo '{"success": false, "message": ' . $e->getMessage();
}
$conn = null;
?>
