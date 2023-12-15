<?php

use Illuminate\Database\Eloquent\Model;

if (!function_exists("handle_relations")) {

    function handle_relations(string $relations, array $possible_relations, Model $model)
    {
        if (strpos($relations, ",")) {
            $exploded_relations = explode(",", $relations);
            $all_relations_exists = true;

            for ($i = 0; $i < count($exploded_relations); $i++) {
                if (!in_array($exploded_relations[$i], $possible_relations)) {
                    $all_relations_exists = false;
                    break;
                }
            }

            if ($all_relations_exists) {
                $model = $model->with($exploded_relations);
            } else {
                abort(400, "The requestes relations are not supported");
            }
        } else {
            if (in_array($relations, $possible_relations)) {
                $model = $model->with($relations);
            } else {
                abort(400, "The requestes relation is not supported");
            }
        }

        return $model;
    }
}

if (!function_exists("handle_fields")) {

    function handle_fields(string $fields, array $possible_fields, Model $model)
    {

        if (strpos($fields, ",")) {

            $fields_exists = true;
            $exploded_fields = explode(",", $fields);


            for ($i = 0; $i < count($exploded_fields); $i++) {

                $field = $exploded_fields[$i];

                if (!in_array($field, $possible_fields)) {
                    $fields_exists = false;
                    break;
                }
            }

            if ($fields_exists) {
                return $model->select($exploded_fields);
            } else {
                abort(400, "The requested fields does not exist");
            }
        } else {
            if (!in_array($fields, $possible_fields)) {
                abort(400, "The requested field does not exist");
            } else {
                return $model->select($fields);
            }
        }
    }
}
if (!function_exists('generateAbbreviation')) {
    function generateAbbreviation($categoryName) {
        // Split the category name into words
        $words = explode(' ', $categoryName);

        // Initialize an empty abbreviation
        $abbreviation = '';

        foreach ($words as $word) {
            // Take the first character of each word and append it to the abbreviation
            $abbreviation .= strtoupper(substr($word, 0, 1));
        }

        // You can further customize the abbreviation generation logic as needed

        return $abbreviation;
    }
}
if(!function_exists('convert_array')){
    function convert_array(array $data)
    {
        $result = [];
        foreach ($data as $piece) {
            $result[$piece["id"]] = [];

            if ($piece["quantity"] ?? false) {
                $result[$piece["id"]]["quantity"] = $piece["quantity"];
            }

            if ($piece["coli"] ?? false) {
                $result[$piece["id"]]["coli"] = $piece["coli"];
            }
        }
        return $result;
    }
}