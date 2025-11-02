<?php
require_once "../db/database.php";

class UserDAO {
    private $conn;
    private $table = "users";

    public function __construct() {
        $db = new Database();
        $this->conn = $db->getConnection();
    }

    // CREATE
    public function create($username, $password, $email) {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $query = "INSERT INTO $this->table (username, password, email)
                  VALUES (:username, :password, :email)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":password", $hash);
        $stmt->bindParam(":email", $email);
        return $stmt->execute();
    }

    // READ
    public function getAll() {
        $query = "SELECT id, username, email, created_at FROM $this->table";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // AUTH (login)
    public function authenticate($username, $password) {
        $query = "SELECT * FROM $this->table WHERE username=:username";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":username", $username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        return false;
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
