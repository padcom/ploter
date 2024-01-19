# CNC Ploter

The CNC Ploter project is an umbrella for all things CNC machine related. It will contain programs and descriptions for how to deal with cutting / laser engraving things using the CNC machine I've built.

## Bits and pieces

The process of creating a physical part is split into 3 stages:
- CAD design (output: stl)
- CAM preparation (output: gcode)
- milling

This part describes how you design and cut parts off of a stock (piece of material)

## CAD: Designing parts

The best way to design parts is to use [Tinkercad](https://tinkercad.com). It is an app that works by joining holes with shapes so basically just like you would in real life: have a stock (source material) and cut holes in it.

Please note that while cutting parts on the CNC machine you need to pay special attention to the design. Details of the part need to be accessible from _above_. There can't be any holes that are covered or else the process will not be doable with a milling bit hanging form the top of the stock.

Once the part is ready export it as an STL file. That file will later on be used in the CAM processor.

Example: [Vitti's cup stand](https://www.tinkercad.com/things/58saMstAzoC-vitti-cup-stand)

## CAM: Preparing `gcode` for the machine

Once you have your STL it is time to figure out how the milling bit is going to travel inside the stock material.

The best tools for the job is FreeCAD. It uses the plane-by-place material removal which for most cases is the fastest way to get your part cut out. As an alternative tool, if your input is an SVG image the [JSCut](https://jscut.org) can be used.

### [FreeCAD](https://www.freecad.org/)

FreeCAD is a massive tool, way way way beyond what this README tries to explain. There is a multitude of tutorials on YouTube that you could follow to get more out of this too. It is a gread 3D parametric designer and you could just as well use it instead of [Tinkercad](https://tinkercad.com). I personally prefer the ideology behind Tinkercad that's why this documents takes it for granted that you work with an STL file instead of working directly with FreeCAD's objects.

#### Importing STL into FreeCAD

First you need to import the STL you've designed to FreeCAD. This is done by selecting File -> Import and navigating to the place where you have exported the STL with your design from [Tinkercad](https://tinkercad.com).

That will create a mesh. In FreeCAD, in order to do anything you need a thing called a _solid_. This means that we need to convert the imported mesh into a solid. This is done in the `Part` workbench in 4 steps:

- Select the mesh
- From the menu select `Part` -> `Create shape from mesh`
- Select the newly created shape
- From the menu select `Part` -> `Create a copy` -> `Refine shape`
- Delete the original mesh as it is not useful anymore

Please note deleting the intermediate non-refined shape is not possible because the refined shape relies on the original geometry to perform the refinement.

#### Creating a job

In order to tell FreeCAD that you want it to create a cutout you need to create a new _path job_. For that to work you need to go to the `Path` workbench and select your solid and clicking on it in the model tree view.

Next, you need to create the job by clicking `Path` -> `Job`. This will ask you a lot of questions but not everything is super important:

- In the `Setup` tab you need to make sure your `stock` is defined properly. For example, if you plan on mill from the top of the surface of your material then please configure the `Z` part of the stock to be `0`. Otherwise the milling bit will need to take _off_ a bit of the material before the milling bit can actually start carving out the part. This _can_ be useful if your _stock_ is uneven, but for the most part you want both the `Z` to be 0 on both ends (top and bottom)
- In the `Tools` tab you need to configure the bits you'll be using for milling. If you'll go for a 2-pass approach like I do (roughing and finishing) you'll need 2 types of milling bits for the specific phases: one wide one and one narrow one. I use 1/8th for the roughing phase and 1mm for the finishing phase
- In the `Output` phase you'll need to select 2 things. The _processor_ to `GRBL` and then the `Output File` to where you expect the G-Code file to be created.

Please note that in regular circumstances you're going to need at lease 3 jobs. One for roughing everything, one for the details and one for pocketing the thing out of the stock.

#### Defining cuts

Now that we have the part imported into FreeCAD it is time to prepare a _path_ for the milling bit to travel to get the part carved out of the stock.

To do this, select the `Path` workbench and click the Path -> Job menu item. This will create a new project for milling/carving out your piece out of the stock.

Now here things start to get interesting. The CAM processor that you'll be using here is pretty advanced and describing it in full makes no sense so I'll just explain how you can carve an example piece with it.

The example piece is defined in TinkerCAD here. It consists of mainly 2 parts:
- a thick border
- text

To make the most of your CNC machine you'll need 4 milling operations:

- _pocketing_ the border
- initial _pocketing_ of the text
- refinement _pocketing_ of the text
- cutting out (called _outlining_) the part out of the stock

##### Pocketing the border

This is the simplest thing to do. Select the lowered face that depicts the border, click `Path` -> `Pocket shape`, select the `3.175` flat endmill, select pattern `Offset` and press OK. This will create a path for the milling bit that will carve out a pocket 2mm deep in the most efficient way.

##### Rough pocketing the letters

This is a tiny bit more complex but very similar to the previous step. Instead of selecting the one border face you will select all the faces from the text. Everything stays the same. This will take out a lot of material from the stock so that the final 1mm bit doesn't have to do much work.

##### Finishing pass

The 3.175 (or 1/8") milling bit is not small enough to mill the details. For this you'll need a smaller bit. The process is exactly the same as for the previous step with the exception that you select the small milling bit.

##### Carving out the part off of the stock

Now to the last part - getting the model out off the stock. This is done easiest by using the original 3.175 bit, selecting the outer face of the model and using the 3.175 bit with the `Path` -> `Profile` operation. This will essentially create a multi-level path that the tool will follow in order to go from the top of the stock to the bottom of it.


## Running the gcode

There is a multitude of applications that can feed the gcode to the machine. Among the most prominent ones are:

- [Universal GCode Sender](https://winder.github.io/ugs_website/)
- [CNC.js](https://cnc.js.org/) (my personal favorite)

Check out the respective project page to see how to run this software. It needs to run on the computer that is connected to the CNC (in my case that is a Raspberry PI - hence CNC.js is my favorite choice).

You just open up the connection to the machine, load up the gcode created by FreeCAD, center and reset the machine to 0,0,0 (x, y and z where the top of the material is) and you just press play watching the machine in action.

That's it!

