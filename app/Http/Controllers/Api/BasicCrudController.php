<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

abstract class BasicCrudController extends Controller
{
    protected abstract function getModel(): string;
    protected abstract function getRulesStore(): array;
    protected abstract function getRulesUpdate(): array;

    public function index(): Collection
    {
        return $this->getModel()::all();
    }

    public function store(Request $request): Model
    {
        $validationData = $this->validate($request, $this->getRulesStore());
        /** @var Model $obj */
        $obj = $this->getModel()::create($validationData);
        $obj->refresh();
        return $obj;
    }

    protected function findOrFail($id): Model
    {
        $model = $this->getModel();
        $keyName = (new $model)->getRouteKeyName();
        return $this->getModel()::where($keyName, $id)->firstOrFail();
    }

    public function show($id): Model
    {
        $obj = $this->findOrFail($id);
        return $obj;
    }

    public function update(Request $request, $id): Model
    {
        $validationData = $this->validate($request, $this->getRulesUpdate());
        $obj = $this->findOrFail($id);
        $obj->update($validationData);
        return $obj;
    }

    public function destroy($id): Response
    {
        $obj = $this->findOrFail($id);
        $obj->delete();
        return response()->noContent();
    }
}
