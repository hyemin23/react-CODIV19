import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2';
const Contents = () => {


    //변수 설정
    const confirmedLabel = "누적 확진자 추이";
    const quarantinedLabel = "월별 격리자 현황";
    const totalLabel = "누적 확진, 해제, 사망";

    //확진자
    const [confirmedData, setConfirmedData] = useState({});
    //격리자
    const [quarantinedData, setQuarantinedData] = useState({});
    //총
    const [total, setTotal] = useState({});


    //mount됐을때 바로 실행되게끔 하는 메서드
    useEffect(() => {
        const fetchApi = async () => {
            const res = await axios.get('https://api.covid19api.com/total/country/kr');

            makeData(res.data);
        };

        const makeData = (items) => {
            //acc : 쌓여서 계속 다음 반복문으로 넘겨지는 전달 값
            //cur : 현재 반복문이 돌고있는 item 값
            //[] : 초기 값
            const arr = items.reduce((acc, cur) => {

                const currentDate = new Date(cur.Date);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const date = currentDate.getDate();
                const confirmed = cur.Confirmed;
                const active = cur.Active;
                const death = cur.Deaths;
                const recovered = cur.Recovered;


                //년 , 월이 같으면
                const findItem = acc.find(a => a.year === year && a.month === month);

                //findItem = 'undefined일 경우'
                if (!findItem) {
                    acc.push({
                        year: year
                        , month: month
                        , data: date
                        , confirmed: confirmed
                        , active: active
                        , death: death
                        , recovered: recovered
                    });
                }

                return acc;
            }, []);


            //월별
            const labels = arr.map(a => `${a.month + 1}월`);

            //확진자
            //state update : object형태
            setConfirmedData({
                labels
                , datasets: [
                    {
                        label: confirmedLabel
                        , backgroundColor: "salmon"
                        , fill: true
                        , data: arr.map(a => {
                            return a.confirmed;
                        })
                    },
                ]
            });


            //격리자
            setQuarantinedData({
                labels
                , datasets: [{
                    label: quarantinedLabel
                    , borderColor: "salmon"
                    , fill: false
                    , data: arr.map(a => a.active)
                }]
            });


            //총 누적 
            //마지막 index 선택

            const last = arr[arr.length - 1];
            console.log(arr);
            setTotal({
                labels: ["확진자", "격리해제", "사망"]
                , datasets: [{
                    label: `${totalLabel}비율`
                    , backgroundColor: ["#ff3d67", "#059bff", "#ffc233"]
                    , borderColor: ["#ff3d67", "#059bff", "#ffc233"]
                    , fill: true
                    , data: [last.confirmed, last.recovered, last.death]
                }]
            })
        };
        fetchApi();
    }, []);




    return (
        <section>
            <h2>국내 코로나 현황</h2>
            <div className="contents">
                <div>
                    <Bar data={confirmedData} options={
                        {
                            title: { display: true, text: confirmedLabel, fontSize: 16 },
                            legend: { display: true, position: "bottom" }

                        }}
                    />
                </div>
                <div>
                    <Line data={quarantinedData} options={{
                        title: { display: true, text: quarantinedLabel, fontSize: 16 }
                        , legend: { display: true, position: "bottom" }

                    }}
                    />
                </div>
                <div>
                    <Doughnut data={total} option={{
                        title: { display: true, text: totalLabel, fontSize: 16 }
                        , legend: { display: true, posistion: "bottom" }
                    }} />
                </div>
            </div>
        </section>
    )
}

export default Contents
