<?php
require_once 'config.php';

Class mongoCustom {
	private $mongo;
	public $docId;//id of document
	public $page;//page
	public $limit = 10;
	public $fields = [];

	function __construct(){
		$this->post = $_POST;
		$this->page = isset($_GET['page']) ? intval($_GET['page']) : 0;
		$this->docId = isset($_GET['id']) ? $_GET['id'] : "";
	}
	
	public function get($f){
		return $this->$f;
	}
	
	public function set($f, $v){
		$this->$f = $v;
	}
	
	public function connect() {
		$mongourl = sprintf("mongodb://%1s:%2s@%3s:%4s", USER, PASS, HOST, PORT);
		$this->set("mongo", new MongoClient( $mongourl ));
	}

	public function close() {
		$this->get("mongo")->close();	
	}

	public function getinstance() {
		$this->connect();
		$mongo = $this->get('mongo');
		return $mongo->selectDB( DB )->selectCollection( COLLECTION ); 
	}
	
	public function find() {
		$m = $this->getinstance();
		$post = !empty($this->post) ? $this->post : [];//if null given
		if(isset($post['_id'])) $post['_id'] =  new MongoId($post['_id']);//mongid to find by id
		$skip = $this->page * $this->limit;
		$rows = $m->find($post)->sort(array('_id' => -1))->skip($skip)->limit($this->limit);
		$rowsArray = ['result' => iterator_to_array($rows) , "total" => $m->count(), "limit" => $this->limit];
		echo json_encode($rowsArray);
		$this->close();
	}

	public function insert() {
		$m = $this->getinstance();
		$this->post['created_at'] = new MongoDate();
		if( !empty($this->post)) {
			$r = $m->insert($this->post);
			echo json_encode($r);
		}
		$this->close();
	}

	public function delete() {
		if(empty($this->docId)) return false;
		$m = $this->getinstance();
		$r = $m->remove(['_id' =>  new MongoId($this->docId) ]);
		echo json_encode($r);
		$this->close();
	}
	public function update() {
		$m = $this->getinstance();
		$this->post['updated_at'] = new MongoDate();
		if( !empty($this->post)) {
			$r = $m->update(['_id' =>  new MongoId($this->docId)], ['$set' => $this->post]);
			echo json_encode($r);
		}
		$this->close();
	}
}
