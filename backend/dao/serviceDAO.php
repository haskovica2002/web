<?php
require_once "../db/database.php";

class ServiceDAO {
    private $conn;
    private $table = "services";

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // CREATE
    public function create($title, $description, $icon) {
        $query = "INSERT INTO $this->table (title, description, icon)
                  VALUES (:title, :description, :icon)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":icon", $icon);
        return $stmt->execute();
    }

    // READ
    public function getAll() {
        $query = "SELECT * FROM $this->table ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // UPDATE
    public function update($id, $title, $description, $icon) {
        $query = "UPDATE $this->table SET title=:title, description=:description, icon=:icon WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":icon", $icon);
        return $stmt->execute();
    }

    // DELETE
    public function delete($id) {
        $query = "DELETE FROM $this->table WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
?>
