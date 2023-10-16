<?php

namespace App\Http\Controllers;

use App\Imports\ImportPositions;
use App\Models\Menuitem;
use App\Models\Position;
use App\Models\Privilage;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class PositionController extends Controller
{
    
      

    public $possible_relations = ["staff","privilage","privilage.menuitem","privilage.menuitem.menugroup"];
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $paginate = $request->input("paginate");
        $search = $request->input("search");
        $relations = $request->input("relations");
        // $fields = $request->input("fields");

        $Position = new Position();

        if ($relations) {
            $Position = handle_relations($relations, $this->possible_relations, $Position);
        }

        // if ($fields) {
        //     $products = handle_fields($fields, $this->possible_fields, $products);
        // }

        if ($search) {
            $Position = $Position->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $Position->paginate($paginate);

        return response()->json([
            "data"=>$Position->get()
        ],Response::HTTP_OK);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "name" => "required|string",
            "shortname" => "string",
            "menu"=>'array'
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $validated['shortname'] = generateAbbreviation($request->name);
        try{
            $newValue= Position::create($validated);
            if ($newValue) {
                // get all menu for insert privilege later
                $menuItems = Menuitem::get()->toArray();
                foreach ($menuItems as $keyX => $menuItem) {
                    // set param and default value to insert privilege
                    $privilege['position_id'] = $newValue->id;
                    $privilege['menuitem_id'] = $menuItem['id'];
                    $privilege['view'] = 0;
                    $privilege['add'] = 0;
                    $privilege['edit'] = 0;
                    $privilege['delete'] = 0;
                    $privilege['export'] = 0;
                    $privilege['import'] = 0;
                    if (array_key_exists('menu', $validated)) {
                        foreach ($validated['menu'] as $keyY => $menu) {
                            if ($menuItem['id'] == $keyY) {
                                if (array_key_exists('view', $menu)) {
                                    $privilege['view'] = 1;
                                }
                                if (array_key_exists('add', $menu)) {
                                    $privilege['add'] = 1;
                                }
                                if (array_key_exists('edit', $menu)) {
                                    $privilege['edit'] = 1;
                                }
                                if (array_key_exists('delete', $menu)) {
                                    $privilege['delete'] = 1;
                                }
                                if (array_key_exists('export', $menu)) {
                                    $privilege['export'] = 1;
                                }
                                if (array_key_exists('import', $menu)) {
                                    $privilege['import'] = 1;
                                }
                            }
                        }
                    }
                    // create privilege for new role
                    Privilage::create($privilege);
                }
            }
        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Position Name already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil dibuat",
            "data"=>$newValue
        ],Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request ,$id)
    {
        $relations = $request->input("relations");

        $Position = new Position();

        if ($relations) {
            $Position = handle_relations($relations, $this->possible_relations,  $Position);
        }


        return $Position->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(),[
            "name" => "string",
            "menu"=>"array",
            "id"=>"integer"
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        
        try{
            $Position = Position::where('id', $request->id)->with('privilage')->first();
        if ($Position) {
            foreach ($Position->privilage as $keyX => $positionPrivilege) {
                // set param and default value to update privilege
                $privilege['view'] = 0;
                $privilege['add'] = 0;
                $privilege['edit'] = 0;
                $privilege['delete'] = 0;
                $privilege['export'] = 0;
                $privilege['import'] = 0;
                if (array_key_exists('menu', $validated)) {
                    foreach ($validated['menu'] as $keyY => $menu) {
                        if ($positionPrivilege['menuitem_id'] == $keyY) {
                            if (array_key_exists('view', $menu)) {
                                $privilege['view'] = 1;
                            }
                            if (array_key_exists('add', $menu)) {
                                $privilege['add'] = 1;
                            }
                            if (array_key_exists('edit', $menu)) {
                                $privilege['edit'] = 1;
                            }
                            if (array_key_exists('delete', $menu)) {
                                $privilege['delete'] = 1;
                            }
                            if (array_key_exists('export', $menu)) {
                                $privilege['export'] = 1;
                            }
                            if (array_key_exists('import', $menu)) {
                                $privilege['import'] = 1;
                            }
                        }
                    }
                }
                // update privilege
                Privilage::where('id', $positionPrivilege->id)->update($privilege);
            }
            $Position->update($validated);
        }

        }
        catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => 'This Position Name already exists'], 500);
            }
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }

        return response()->json([
            "message"=>"Data Berhasil diUpdate",
            "data"=>$Position
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Position $position)
    {
        $privilege=Privilage::findOrfail($position->id);
        $privilege->delete();
        $position->delete();
        return response(null, 204);
    }

    public function MultipleDelete(Request $request)
    {
        $id = $request->input('id');
        $positions = Position::whereIn('id', $id)->get();
        foreach ($positions as $position) {
            $privilege=Privilage::findOrfail($position->id);
            $privilege->delete();
            $position->delete();
        }
        return response()->json([
            "message"=>"data berhasil di delete"
        ],Response::HTTP_OK);
    }
    
    public function import(Request $request){
        $file = $request->file('excel_file');

        try{
            Excel::import(new ImportPositions,$file);
        }catch(QueryException $e){
            if ($e->errorInfo[1] === 1062) { 
                return response()->json(['error' => $e], 500);
            }
        }
        return response()->json([
            'message'=>"berhasil Import"
        ],Response::HTTP_OK);
    }
}
