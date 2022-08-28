import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { Box, Typography } from "@mui/material";

const scaleBy = 1.1;
const width = 12;

const MapCanvas = ({
  lands,
  loading,
  setCurrData,
  landType,
  premiumType,
  size,
}) => {
  const [eid, setId] = useState(0);
  const [stage, setStage] = useState({
    scale: 1.2,
    x: 700,
    y: 400,
  });

  useEffect(() => {
    if (typeof window !== undefined && window.innerWidth < 600) {
      setStage({
        scale: 1,
        x: 150,
        y: 350,
      });
    }
  }, []);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    if (newScale < 0.9 || newScale > 1.8) return;

    setStage({
      scale: newScale,
      x: (stage.getPointerPosition().x / newScale - mousePointTo.x) * newScale,
      y: (stage.getPointerPosition().y / newScale - mousePointTo.y) * newScale,
    });
  };

  const getColor = (land, size, id, status) => {
    if (status === "MINTED") {
      return "#00e600";
    } else if (status === "BOOKED") {
      return "#b3b300";
    } else if (status === "NOT_FOR_SALE") {
      return "#737373";
    }
    
    if (land === "LOL" || size === 3) {
      return "#321d70";
    } else if (land === "CITY") {
      return "#d82eee";
    } else if (land === "NEIGHBOUR") {
      return "#a365ef";
    } else if (land === "PREMIUM LAND") {
      return "#f8cdfc";
    } else {
      return "#8a1fae";
    }
  };

  const Map = lands?.map((data) => {
    return (
      <>
        <Rect
          x={data?.x * width}
          y={-data?.y * width}
          width={width * data?.size}
          height={width * data?.size}
          fill={getColor(data?.landType, data?.size, data?._id, data?.status)}
          shadowBlur={eid === data?._id ? 2 : 0}
          stroke={eid === data?._id ? "#81f78e" : "black"}
          zIndex={eid === data?._id ? 5000 : -500}
          strokeWidth={eid === data?._id ? 1 : 0.2}
          onClick={() => {
            setId(data?._id);
            setCurrData(data);
          }}
          onTap={() => {
            setId(data?._id);
            setCurrData(data);
          }}
        />
      </>
    );
  });

  return (
    <>
      {loading ? (
        <Box>
          <Typography variant="h6" color="black">
            Loading...
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            ".konvajs-content": {
              position: "fixed !important",
            },
          }}
        >
          <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            onWheel={handleWheel}
            scaleX={stage.scale}
            scaleY={stage.scale}
            x={stage.x}
            y={stage.y}
            draggable={true}
            dragBoundFunc={({ x, y }) => {
              console.log("#### x, y-", x, y);

              if (typeof window !== undefined && window.innerWidth < 600) {
                if (x < -300) {
                  x = -300;
                } else if (x > 600) {
                  x = 600;
                }
              } else {
                if (x < -200) {
                  x = -200;
                } else if (x > 1700) {
                  x = 1700;
                }
              }

              if (y > window.innerHeight) {
                y = window.innerHeight;
              } else if (y < -200) {
                y = -200;
              }
              return { x, y };
            }}
            style={{ backgroundColor: "#63579c" }}
          >
            <Layer>{Map}</Layer>
          </Stage>
        </Box>
      )}
    </>
  );
};

export default MapCanvas;
