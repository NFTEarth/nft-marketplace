import {useEffect, useMemo, useRef, useState} from 'react'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import useSound from "use-sound";
import {useFortune, useMounted} from "../../hooks";
import {PlayerType} from "./Player";
import {Round, RoundStatus} from "../../hooks/useFortuneRound";
import {useMediaQuery} from "react-responsive";

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
}

export interface WheelProps extends HighchartsReact.Props {
  onWheelEnd: any
  winner?: `0x${string}`
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
  round: Round
  countdown: number
  players: PlayerType[]
  enableAudio: boolean
  hoverPlayerIndex: number
}

const findWinner = (data: any[], winner?: `0x${string}`, randomize = true) : winnerWheel => {
  if (!data || !winner) {
    return {
      wheelPoint: 360,
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

const spinWheelAudioSpriteMap = {
  start: [0, 1200, true],
  end: [500, 2000, false]
} as any;

const Wheel = (props: WheelProps) => {
  const { container, winner, onWheelEnd, ...restProps } = props;
  const chartComponentRef = useRef<typeof HighchartsReact>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const [wheelEnding, setWheelEnding] = useState(0);
  const triangleRef = useRef<any>();
  const animationSpeed = 30;
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted

  const { data: {
    round,
    countdown,
    players,
    enableAudio,
    hoverPlayerIndex
  }, setHoverPlayerIndex } = useFortune<FortuneData>(d => d)


  const [playWin] = useSound(`/audio/win.mp3`, {
    interrupt: true,
    volume: 0.8
  })
  const [playClock, { stop: stopClock, sound: clockAudio }] = useSound(`/audio/clock.mp3`, {
    volume: 0.8
  })
  clockAudio?.loop(true)
  const [playStart] = useSound(`/audio/game-start.mp3`, {
    volume: 0.8
  })
  const [playWheel, { stop: stopWheel,  }] = useSound(`/audio/wheel-spin.mp3`, {
    sprite: spinWheelAudioSpriteMap,
    interrupt: true,
    volume: 0.8
  })

  useEffect(() => {
    setWheelEnding(0);
  }, [round?.roundId])

  useEffect(() => {
    if (!enableAudio) {
      return;
    }

    if (RoundStatus.Open === round?.status) {
      playStart?.()
    }

    if (RoundStatus.Drawing === round?.status && players.length > 1) {
      playClock()
    }

    if (RoundStatus.Drawn === round?.status) {
      playWheel?.({ id: 'start' })
    }
  }, [round?.status, round?.roundId, enableAudio])

  useEffect(() => {
    if (!enableAudio) {
      return;
    }

    if (wheelEnding === 1) {
      playWheel?.({ id: 'end' })
    }

    if (wheelEnding === 2) {
      playWin?.()
      setWheelEnding(2)
    }
  }, [wheelEnding, enableAudio])

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
    setHoverPlayerIndex?.(undefined);

    if ([RoundStatus.Drawing, RoundStatus.Drawn].includes(round?.status)) {
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

    // if (round?.status === RoundStatus.Drawing) {
    //   spinIntervalRef.current = setInterval(() => {
    //     startAngle -= diff;
    //
    //     if (startAngle < 360) {
    //       startAngle += 360;
    //     }
    //
    //     chart.series?.[0]?.update({ startAngle }, true, false, false);
    //   }, animationSpeed)
    // }

    if (RoundStatus.Drawn === round?.status) {
      const { wheelPoint, winnerIndex } = findWinner(chart.series?.[0]?.data, winner, false)
      diff = -(wheelPoint * 30)
      spinIntervalRef.current = setInterval(() => {
        startAngle = diff % 360;
        diff += (wheelPoint / 4)

        chart.series?.[0]?.update({ startAngle: startAngle }, true, false, false);

        if (diff > -(360 * 10) && wheelEnding === 0) {
          setWheelEnding(1)
        }

        if (diff > (wheelPoint + 90)) {
          clearInterval(spinIntervalRef.current);
          onWheelEnd(winnerIndex);
          setHoverPlayerIndex?.(winnerIndex);

          if (wheelEnding != 1) {
            setWheelEnding(2);
          }
        }
      }, animationSpeed)
    }
  }, [round?.status, round?.roundId, winner])

  useEffect(() => {
    const chart = chartComponentRef.current?.chart
    const start = round?.cutoffTime - round?.duration;
    const current = ((new Date()).getTime() / 1000);
    const progressPercent = 100 * (1 - (current - start) / (round?.cutoffTime - start))

    if (chart) {
      chart.series?.[1]?.update({
        data: [RoundStatus.Drawing, RoundStatus.Drawn].includes(round?.status) ?
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

  }, [round?.status, round?.roundId, round?.cutoffTime, countdown])

  const options = useMemo<Highcharts.Options>(() => {
    return {
      chart: {
        name: '',
        animation: false,
        backgroundColor: 'transparent',
        renderTo: 'container',
        type: 'pie',
        width: isSmallDevice ? 380 : 490,
        height: isSmallDevice ? 380 : 490,
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
          data: (players.length && RoundStatus.Cancelled !== round?.status) ? players : [{
            y: 100,
            color: RoundStatus.Cancelled === round?.status ? '#F00' : '#AAA'
          }],
          type: 'pie',
          size: '90%',
          innerSize: '75%',
          showInLegend: false,
          enableMouseTracking: players.length > 0 && ![RoundStatus.Cancelled, RoundStatus.Drawn].includes(round?.status),
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
  }, [players, isSmallDevice])

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