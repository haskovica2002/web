<?php
require_once "../db/database.php";

class ContactDAO {
    private $conn;
    private $table = "contacts";

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // CREATE
    public function create($name, $email, $message) {
        $query = "INSERT INTO $this->table (name, email, message)
                  VALUES (:name, :email, :message)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":message", $message);
        return $stmt->execute();
    }

    // READ
    public function getAll() {
        $query = "SELECT * FROM $this->table ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // DELETE (usually no need to update contact messages)
    public function delete($id) {
        $query = "DELETE FROM $this->table WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
?>
