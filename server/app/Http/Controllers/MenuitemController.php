<?php

namespace App\Http\Controllers;

use App\Models\Menuitem;
use App\Models\Position;
use App\Models\Privilage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class MenuitemController extends Controller
{
    public $possible_relations = ["menugroup","privilage"];
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

        $menuitem = new Menuitem();

        if ($relations) {
            $menuitem = handle_relations($relations, $this->possible_relations, $menuitem);
        }

        // if ($fields) {
        //     $products = handle_fields($fields, $this->possible_fields, $products);
        // }

        if ($search) {
            $menuitem = $menuitem->where("id", $search)->orWhere("name", "like", "%$search%");
        }

        if ($paginate) return $menuitem->paginate($paginate);

        return response()->json([
            "data"=>$menuitem->get()
        ],Response::HTTP_OK);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        
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
            'name'=>'required|string',
            'url'=>'required|string',
            'icon'=>'required|string',
            'menugroup_id'=>'required|integer'
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        try{
            $newValue= Menuitem::create($validated);
            if ($newValue) {
                // new$newValue privilege of new menu item for all role
                $roles = Position::all();
                if ($roles) {
                    foreach ($roles as $keyX => $role) {
                        // set param and default value to insert privilege
                        $privilege['position_id'] = $role->id;
                        $privilege['menuitem_id'] = $newValue->id;
                        $privilege['view'] = 0;
                        $privilege['add'] = 0;
                        $privilege['edit'] = 0;
                        $privilege['delete'] = 0;
                        $privilege['import'] = 0;
                        $privilege['export'] = 0;
                        // insert privilege
                        Privilage::create($privilege);
                    }
                }
            }
        }
        catch(\Exception $e){
            return response()->json([
                "error"=>$e->getMessage()
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
    public function show(Request $request,$id)
    {
        $relations = $request->input("relations");

        $menuitem = new Menuitem();

        if ($relations) {
            $menuitem = handle_relations($relations, $this->possible_relations,  $menuitem);
        }

        return $menuitem->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request,$id)
    {
        
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
            'name'=>'string',
            'url'=>'string',
            'icon'=>'required|string',
            'menugroup_id'=>'integer',
            'id'=>'integer'
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated = $validator->validated();
        $menuitem = Menuitem::findOrfail($request->id);
        try{
            $menuitem->update($validated);
        }
        catch(\Exception $e){
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }
        return response()->json([
            "message"=>"Data Berhasil Update",
            "data"=>$menuitem
        ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Menuitem $menuitem,$id)
    {
        $menuitem->delete();
        return response(null, 204);
    }
}
