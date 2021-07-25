console.clear();
const start = Date.now();

const createImage = (
  data: Uint8Array,
  customRect: EllipseNode | RectangleNode | null = null
) => {
  const nodes: BaseNode[] = [];
  let imageHash = figma.createImage(new Uint8Array(data)).hash;
  let rect;
  if (customRect) {
    rect = customRect;
  } else {
    rect = figma.createEllipse();
  }
  rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash }];
  figma.currentPage.appendChild(rect);
  nodes.push(rect);
  figma.viewport.scrollAndZoomIntoView(nodes);
};

const getMany = (data: Uint8Array[], selection: readonly SceneNode[]) => {
  // @ts-ignore

  data
    .slice(0, data.length === selection.length ? data.length : data.length - 1)
    .forEach((image, index) => {
      if (
        selection[index].type === 'RECTANGLE' ||
        selection[index].type === 'ELLIPSE'
      ) {
        try {
          // @ts-ignore
          createImage(image, selection[index]);
        } catch (error) {
          figma.notify('Image tyoe is unspported');
        }
      } else {
        figma.notify('Please selcct a rectangle or Elipse');
      }
    });
};

const selection = figma.currentPage.selection;

// shwo UI and edit dimensions of plugin frame
if (figma.command === 'random') {
  figma.showUI(__html__, {
    visible: false
  });

  figma.ui.postMessage({
    type: 'random',
    name: '',
    data: selection.length | 1
  });
} else {
  figma.showUI(__html__, {
    width: 790,
    height: 580
  });
}

// Receive Events
figma.ui.onmessage = event => {
  if (event.type === 'close') {
    if (event.message) {
      figma.closePlugin(event.message);
    }
    figma.closePlugin();
  }
  if (event.type === 'show-error') {
    figma.notify('A network error occured, please try again');
    figma.closePlugin();
  }
  if (event.type === 'getimages') {
    if (selection.length === 0) {
      for (const image of event.data) {
        try {
          createImage(image);
        } catch (error) {
          figma.notify('Image tyoe is unspported, please try again');
        }
      }
    } else {
      getMany(event.data, selection);
    }
    figma.closePlugin();
  }

  if (event.type === 'getimagesnoclose') {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      for (const image of event.data) {
        try {
          createImage(image);
        } catch (error) {
          figma.notify('Image tyoe is unspported, please try again');
        }
      }
    } else {
      getMany(event.data, selection);
    }
  }
};

//time taken
const end = Date.now();
const time = ((end - start) / 1000).toFixed(2);
figma.ui.postMessage({
  type: 'time',
  data: `Completed in : ${time}s`
});
console.log('Completed in:', time + 's');

// const eventFunction = () => {
//   // Send event with event type and any object property you want
//   console.log('button clicked');

//   figma.ui.postMessage({
//     type: 'event-name',
//     name: 'arbitrary',
//     data: 'arbitrary'
//   });
// };
