<script setup lang="ts">
import { onMounted, ref } from 'vue';
const mapcontainer$ = ref()
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Graphic from '@arcgis/core/Graphic'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Editor from '@arcgis/core/widgets/Editor'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import Sketch from '@arcgis/core/widgets/Sketch'

onMounted(() => {
    const graphicsLayer = new GraphicsLayer();

    const polygonFeatureLayer = new FeatureLayer({
        source: [], // 空数组初始化图层
        fields: [{
            name: "name",
            alias: "Name",
            type: "string"
        }],
        objectIdField: "ObjectID",
        geometryType: "polygon",
        spatialReference: { wkid: 4326 },

    });

    const map = new Map({
        basemap: "streets-vector",
        layers: [polygonFeatureLayer, graphicsLayer]
    });

    const view = new MapView({
        container:mapcontainer$.value,
        map: map,
        center: [0, 0],
        zoom: 2
    });

    // // 添加 Sketch 小部件用于绘制和删除多边形
    // const sketch = new Sketch({
    //     layer: graphicsLayer,
    //     view: view,
    //     creationMode: "update",
    //     defaultUpdateOptions: {
    //         tool: "reshape",
    //         enableRotation: true,
    //         enableScaling: true,
    //         multipleSelectionEnabled: true
    //     },
    //     // 新增删除工具
    //     defaultCreateOptions: {
    //         hasZ: false,
    //         mode: "hybrid",
    //         tool: "polygon"
    //     }
    // });

    // view.ui.add(sketch, "top-right");

    // // Editor 小部件用于编辑多边形的属性
    // const editor = new Editor({
    //     view: view,
    //     allowedWorkflows: ["update"],
    //     layerInfos: [{
    //         layer: polygonFeatureLayer,
    //         fieldConfig: [{
    //             name: "name",
    //             label: "Name",
    //             editable: true
    //         }]
    //     }]
    // });

    // view.ui.add(editor, "top-left");

    // // 监听 Sketch 完成事件，将绘制的图形添加到 FeatureLayer 中
    // sketch.on("create", function (event) {
    //     if (event.state === "complete") {
    //         const graphic = new Graphic({
    //             geometry: event.graphic.geometry,
    //             attributes: {
    //                 name: "Unnamed"
    //             }
    //         });
    //         polygonFeatureLayer.applyEdits({
    //             addFeatures: [graphic]
    //         });
    //     }
    // });

    // // 监听 Sketch 删除事件，将图形从 FeatureLayer 中删除
    // sketch.on("delete", function (event) {
    //     const graphicsToDelete = event.graphics.map(function (graphic) {
    //         return polygonFeatureLayer.source.find(function (layerGraphic) {
    //             return layerGraphic.geometry.equals(graphic.geometry);
    //         });
    //     });

    //     polygonFeatureLayer.applyEdits({
    //         deleteFeatures: graphicsToDelete
    //     });
    // });

    // // 监听点击事件，编辑多边形的 name 属性
    // view.on("click", function (event) {
    //     view.hitTest(event).then(function (response) {
    //         const results = response.results;
    //         if (results.length > 0) {
    //             const graphic = results.filter(result => result.graphic.layer === polygonFeatureLayer)[0].graphic;
    //             if (graphic) {
    //                 const name = prompt("Enter new name for this polygon:", graphic.attributes.name);
    //                 if (name !== null) {
    //                     graphic.attributes.name = name;
    //                     polygonFeatureLayer.applyEdits({
    //                         updateFeatures: [graphic]
    //                     });
    //                 }
    //             }
    //         }
    //     });
    // });

})
</script>
<template>
    <Story>
        <div class="MapContainer" ref="mapcontainer$">

        </div>
    </Story>
</template>

<style lang="scss" scoped>
.MapContainer {
    width: 1920px;
    height: 1080px;

}
</style>
