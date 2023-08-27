import {useEffect, useMemo, useRef, useState} from 'react'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import useSound from "../../hooks/useSound";
import {useFortune} from "../../hooks";
import {PlayerType} from "./Player";
import {RoundStatus} from "../../hooks/useFortuneRound";

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
}

export interface WheelProps extends HighchartsReact.Props {
  onWheelEnd: any
  winner?: `0x${string}`
  roundId: number
}

const radToDeg = (r: number) => r * 180 / Math.PI;

function getRandomInt(min: number, max: number) {
  return min + (Math.random() * (max - min));
}

type winnerWheel = {
  wheelPoint: number,
  winnerIndex: number
}

type FortuneData = {
  durationLeft: number
  status: number
  countdown: number
  players: PlayerType[]
  enableAudio: boolean
  hoverPlayerIndex: number
}

const findWinner = (data: any[], winner?: `0x${string}`, randomize = true) : winnerWheel => {
  if (!data || !winner) {
    return {
      wheelPoint: 30,
      winnerIndex: -1
    }
  }

  const winnerIndex = data.findIndex(d => {
    return (new RegExp(`${winner}`, 'i')).test(d.address)
  });

  return {
    wheelPoint: randomize ?
      getRandomInt(radToDeg(data[winnerIndex]?.shapeArgs.start), radToDeg(data[winnerIndex]?.shapeArgs.end)) :
      Math.round((radToDeg(data[winnerIndex]?.shapeArgs.start) + radToDeg(data[winnerIndex]?.shapeArgs.end)) / 2) - 90,
    winnerIndex
  };
}

const getProgressColor = (percent: number) => {
  if (percent < 10) {
    return 'red'
  }

  if (percent < 50) {
    return 'orange'
  }

  return 'white'
}

const Wheel = (props: WheelProps) => {
  const { container, roundId, winner, onWheelEnd, ...restProps } = props;
  const chartComponentRef = useRef<typeof HighchartsReact>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const [wheelEnd, setWheelEnd] = useState(false);
  const triangleRef = useRef<any>();
  const animationSpeed = 40;

  const { data: {
    countdown,
    durationLeft,
    status,
    players,
    enableAudio,
    hoverPlayerIndex
  }, setHoverPlayerIndex } = useFortune<FortuneData>(d => d)

  const [playWin] = useSound([
    `/audio/win.mp3`,
    `/audio/win.webm`
  ], {
    interrupt: true,
    volume: 0.8
  })

  useEffect(() => {
    setWheelEnd(false);
  }, [roundId])

  useEffect(() => {
    if (wheelEnd) {
      playWin?.()
    }
  }, [wheelEnd, enableAudio])

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

    chart.series?.[0]?.update({ startAngle: 360 });

    if ([RoundStatus.Drawing, RoundStatus.Drawn].includes(status)) {
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
    let startAngle = chart.series?.[0]?.options?.startAngle | 0;

    if (status === RoundStatus.Drawing) {
      spinIntervalRef.current = setInterval(() => {
        startAngle += diff;

        if (startAngle > 360) {
          startAngle -= 360;
        }

        chart.series?.[0]?.update({ startAngle }, true, false, false);
      }, animationSpeed)
    }

    if (status === RoundStatus.Drawn) {
      const { wheelPoint, winnerIndex } = findWinner(chart.series?.[0]?.data, winner, false)
      diff = 360 * 30
      spinIntervalRef.current = setInterval(() => {
        startAngle = diff % 360;
        diff -= ((diff + 360) - ((diff + 360) * 0.98));

        chart.series?.[0]?.update({ startAngle: startAngle }, true, false, false);

        if (diff < wheelPoint - 5) {
          clearInterval(spinIntervalRef.current);
          setWheelEnd(true);
          onWheelEnd(winnerIndex);
        }
      }, animationSpeed)
    }
  }, [status])

  useEffect(() => {
    const chart = chartComponentRef.current?.chart
    const progressPercent = (countdown / durationLeft) * 100

    if (chart) {
      chart.series?.[1]?.update({
        data: [RoundStatus.Drawing, RoundStatus.Drawn].includes(status) ?
          [{
            y: 100,
            color: '#fff'
          }] :
          [{
            y: progressPercent,
            color: getProgressColor(progressPercent),
          }, {
            y: 100 - progressPercent,
            color: '#4e4e4e'
          }]
      });
    }
  }, [status, countdown])

  const options = useMemo<Highcharts.Options>(() => {
    return {
      chart: {
        name: '',
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
          data: players.length ? players : [{
            y: 100,
            color: '#AAA'
          }],
          type: 'pie',
          size: '90%',
          innerSize: '75%',
          showInLegend: false,
          enableMouseTracking: players.length > 0,
          dataLabels: {
            enabled: false
          },
          tooltip: {
            followPointer: false,
          },
          events: {
            mouseOver: function () {
              //console.log('HOVER', this.data);
            },
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