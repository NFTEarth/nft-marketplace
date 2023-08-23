import {useEffect, useMemo, useRef} from 'react'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import useSound from "use-sound";
import { useFortune } from "../../hooks";
import {PlayerType} from "./Player";

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
}

export interface WheelProps extends HighchartsReact.Props {
  countdown: number
  onWheelEnd: any
}

const radToDeg = (r: number) => r * 180 / Math.PI;

const findWinner = (data:any[]) => {
  if (!data) {
    return -1
  }

  const sliceSize = 360 / data.length;
  const winThreshold = 360 - sliceSize;
  let sliceBeginning; // This marks the beginning of a slice.

  for (let i in data) {
    /*
        Depending on where the arrow is,
        we need to compensate accordingly. In our case,
        the arrow is at the top, hence we need to
        add 90 degrees. We also need to convert from radians to degrees.
     */
    sliceBeginning = radToDeg(data[i].shapeArgs.start) + 90;

    if (sliceBeginning > 360) {
      /*
          Items may have excess degrees. Not to be confused with
          startAngle, which is the angle of the wheel itself.
      */
      sliceBeginning -= 360;
    }
    /*
        The winner is defined as
        the item whose sliceBeginning is bigger than winThreshold, and
        less than, or equal to 360. As we made sure sliceBeginning
        doesn't exceed 360, we need not check for it.
    */
    if (sliceBeginning > winThreshold) {
      return i;
    }
  }

  return -1;
}

const getProgressColor = (percent: number) => {
  if (percent < 60) {
    return 'red'
  }

  if (percent < 120) {
    return 'orange'
  }

  return 'white'
}

const spinWheelAudioSpriteMap = {
  start: [0, 1200, true],
  end: [0, 2000, false]
} as any;

const Wheel = (props: WheelProps) => {
  const { container, countdown, onWheelEnd, ...restProps } = props;
  const chartComponentRef = useRef<typeof HighchartsReact>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const triangleRef = useRef<any>();
  const animationSpeed = 40;

  const { data: status } = useFortune<number>(d => d.status)
  const { data: players } = useFortune<PlayerType[]>(d => d.players)
  const { data: enableAudio } = useFortune<boolean>(d => d.enableAudio)
  const { data: hoverPlayerIndex } = useFortune<number>(d => d.hoverPlayerIndex)

  const [playWin] = useSound([
    `/audio/win.webm`,
    `/audio/win.mp3`
  ], {
    interrupt: true,
    volume: 0.8
  })
  const [playStart] = useSound([
    `/audio/game-start.webm`,
    `/audio/game-start.mp3`
  ], {
    interrupt: true,
    volume: 0.8
  })
  const [playWheel, { stop: stopAudio, sound: wheelSound }] = useSound([
    `/audio/wheel-spin.webm`,
    `/audio/wheel-spin.mp3`
  ], {
    sprite: spinWheelAudioSpriteMap,
    interrupt: true,
    volume: 0.8
  })

  useEffect(() => {
    if (!enableAudio) {
      return;
    }

    if (status === 0) {
      playStart?.()
    }

    if (status === 1) {
      playWheel?.({ id: 'start' })
    }

    if (status === 2) {
      stopAudio?.('start')
      playWheel?.({ id: 'end' })
    }

    if (status === 3) {
      playWin?.()
    }
  }, [status, enableAudio])

  useEffect(() => {
    const chart = chartComponentRef.current?.chart

    if (chart) {
      if (hoverPlayerIndex !== undefined) {
        chart.series?.[0]?.points?.[hoverPlayerIndex]?.select(true, false);
      } else {
        chart.series?.[0]?.points?.forEach((p: Highcharts.Point) => {
          p.select(false);
        })
      }
    }
  }, [chartComponentRef, hoverPlayerIndex])

  useEffect(() => {
    const chart = chartComponentRef.current?.chart

    if (triangleRef.current) {
      triangleRef.current.destroy()
    }

    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current)
      spinIntervalRef.current = undefined;
    }

    if (!chart) {
      return;
    }

    if (status === 0) {
      chart.series?.[0]?.update({ startAngle: 360 * Math.random() });
    }

    if ([1,2].includes(status)) {
      triangleRef.current = chart.renderer.path([
        ['M', chart.chartWidth / 2 - 20, chart.plotTop + 18],
        ['L', chart.chartWidth / 2 + 20, chart.plotTop + 18],
        ['L', chart.chartWidth / 2, chart.plotTop + 50],
        ['Z']
      ])
        .attr({
          fill: 'white',
          zIndex: 3
        })
        .add();
    }

    let diff = 30
    let startAngle = chart.series?.[0]?.options?.startAngle | 360;

    if (status === 1) {
      spinIntervalRef.current = setInterval(() => {
        startAngle += diff;

        // console.log('new startAngle', startAngle);
        if (startAngle > 360) {
          startAngle -= 360;
        }

        chart.series?.[0]?.update({ startAngle }, true, false, false);
      }, animationSpeed)
    }

    if (status === 2) {
      spinIntervalRef.current = setInterval(() => {
        startAngle += diff;

        // console.log('new startAngle', startAngle);
        if (startAngle > 360) {
          startAngle -= 360;
        }

        diff *= 0.97;
        chart.series?.[0]?.update({ startAngle }, true, false, false);

        if (diff < 0.01) {
          const winner: any = findWinner(chart.series?.[0]?.data);
          clearInterval(spinIntervalRef.current);
          onWheelEnd(winner);
        }
      }, animationSpeed)
    }
  }, [status])

  useEffect(() => {
    const chart = chartComponentRef.current?.chart

    if (chart) {
      chart.series?.[1]?.update({
        data: [1,2,3].includes(status) ?
          [{
            y: 100,
            color: '#fff'
          }] :
          [{
            y: countdown / 3,
            color: getProgressColor(countdown),
          }, {
            y: 100 - (countdown / 3),
            color: '#4e4e4e'
          }]
      });
    }
  }, [status, countdown])

  const options = useMemo<Highcharts.Options>(() => {
    return {
      chart: {
        animation: false,
        backgroundColor: 'transparent',
        renderTo: 'container',
        type: 'pie',
        width: 380,
        height: 380,
      },
      events: {
        resize: function () {
          const chart = chartComponentRef.current?.chart;
          if (triangleRef.current) {
            triangleRef.current.destroy();
          }

          if (chart) {
            chart.reflow()
          }
        }
      },
      title: {
        text: ''
      },
      plotOptions: {
        pie: {
          innerSize: '100%',
          animation: false,
        },
        series: {
          shadow: true
        }
      },
      series: [
        {
          name: 'Win Chance',
          borderWidth: 0,
          data: players,
          type: 'pie',
          size: '90%',
          innerSize: '75%',
          showInLegend: false,
          dataLabels: {
            enabled: false
          },
          tooltip: {
            followPointer: false,
          },
          events: {
            mouseOver: (e) => {
              console.log(e.target);
            }
          }
        },
        {
          type: 'pie',
          size: '100%',
          innerSize: '95%',
          name: 'Countdown',
          borderWidth: 0,
          shadow: false,
          enableMouseTracking: false,
          dataLabels: {
            enabled: false
          },
          data: [{
            y: 100,
            color: '#4e4e4e'
          }],
        }
      ],
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      }
    }
  }, [players])

  return (
    <>
      <HighchartsReact
        ref={chartComponentRef}
        highcharts={Highcharts}
        containerProps={{
          style: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }
        }}
        options={options}
        {...restProps}
      />
    </>
  )
}

export default Wheel;