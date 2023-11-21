<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class settingController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function index(Request $request)
    {
        $setting = new Setting();
        return response()->json([
            "data"=>$setting->get()
        ],Response::HTTP_OK);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
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
            'urlImage' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,gif'],
            'urlIcon' => ['required', 'file', 'image', 'mimes:jpeg,png,jpg,gif'],
        ]);
        if($validator->fails()){
            return response()->json([
                "message"=>$validator->errors()
            ],Response::HTTP_BAD_REQUEST);
        }
        $validated= $validator->validate();
        $validated["urlImage"] = $request->file("urlImage")->store("setting_image");
        $validated["urlIcon"] = $request->file("urlIcon")->store("setting_image");
        try{
            $newValue = Setting::create($validated);
        }
        catch(\Exception $e){
            return response()->json([
                "error"=>$e
            ],Response::HTTP_BAD_REQUEST);
        }
        return response()->json([
            "message"=>$newValue
        ],Response::HTTP_OK);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $setting = new Setting();
        return response()->json([
            "data"=>$setting->findOrfail($id)
        ],Response::HTTP_OK);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request)
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
        'id'=>'integer'
    ]);
    if($validator->fails()){
        return response()->json([
            "message"=>$validator->errors()
        ],Response::HTTP_BAD_REQUEST);
    }
    $validated= $validator->validate();
    $setting = Setting::findOrfail($request->id);
    if ($request->hasFile('urlImage')) {
        if($setting->urlImage){
            Storage::delete($setting->urlImage);
        }
        $validated["urlImage"] = $request->file("urlImage")->store("setting_image");
    } 
    if ($request->hasFile('urlIcon')) {
        if($setting->urlIcon){
            Storage::delete($setting->urlIcon);
        }
        $validated["urlIcon"] = $request->file("urlIcon")->store("setting_image");
    } 
    try{
        $setting->update($validated);
    }
    catch(\Exception $e){
        return response()->json([
            "error"=>$e
        ],Response::HTTP_BAD_REQUEST);
    }
    return response()->json([
        "message"=>"data berhasil diupdate"
    ],Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Setting $setting)
    {
        Storage::delete($setting->urlImage);
        Storage::delete($setting->urlIcon);
        return response(null, 204);
    }
}
