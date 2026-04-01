"use client"

const axes = [
  {
    name: "Economic",
    leftPole: "Libertarian",
    rightPole: "Collectivist",
    position: 30,
  },
  {
    name: "Identity",
    leftPole: "Nationalist",
    rightPole: "Globalist",
    position: 70,
  },
  {
    name: "Technology",
    leftPole: "Tech Optimist",
    rightPole: "Tech Sceptic",
    position: 50,
  },
  {
    name: "Society",
    leftPole: "Religious",
    rightPole: "Secularist",
    position: 60,
  },
]

export function ValueSliders() {
  return (
    <div className="space-y-8">
      {axes.map((axis) => (
        <div key={axis.name} className="space-y-3">
          {/* Axis name */}
          <p 
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: "rgba(255, 255, 255, 0.45)" }}
          >
            {axis.name}
          </p>
          
          {/* Slider track */}
          <div className="relative">
            {/* Track line */}
            <div 
              className="h-[2px] w-full rounded-full"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            />
            
            {/* Marker dot */}
            <div 
              className="absolute w-4 h-4 rounded-full border-2"
              style={{ 
                left: `${axis.position}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "rgb(94, 170, 168)",
                borderColor: "rgb(94, 170, 168)",
                boxShadow: "0 0 12px rgba(94, 170, 168, 0.5)"
              }}
            />
          </div>
          
          {/* Pole labels */}
          <div className="flex justify-between">
            <span 
              className="text-sm"
              style={{ 
                color: axis.position < 50 ? "rgb(94, 170, 168)" : "rgba(255, 255, 255, 0.4)"
              }}
            >
              {axis.leftPole}
            </span>
            <span 
              className="text-sm"
              style={{ 
                color: axis.position > 50 ? "rgb(94, 170, 168)" : "rgba(255, 255, 255, 0.4)"
              }}
            >
              {axis.rightPole}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
