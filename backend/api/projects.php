<?php
require_once "../dao/projectDAO.php";

$dao = new ProjectDAO();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo json_encode($dao->getAll());
        break;
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode(["success" => $dao->create($data->title, $data->description, $data->image, $data->link)]);
        break;
    case 'PUT':
    case 'PATCH':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode(["success" => $dao->update($data->id, $data->title, $data->description, $data->image, $data->link)]);
        break;
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        echo json_encode(["success" => $dao->delete($data->id)]);
        break;
}
?>
