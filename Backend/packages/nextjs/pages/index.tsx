import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import {
  useEthPrice, // useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldContractWrite,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";

// import { useAccount } from "wagmi";

// Setting roll value as a constant.
const ROLL_VALUE = "0.002";

type Players = {
  player: string;
  roll: string;
  roll1: string;
  roll2: string;
  roll3: string;
};

type Winners = {
  winner: string;
  matched: string;
  amount: string;
};

const Home: NextPage = () => {
  const [players, setPlayers] = useState<Players[]>([]);
  const [winners, setWinners] = useState<Winners[]>([]);
  const [diceRolled, setDiceRolled] = useState<boolean>(false);
  const [diceRollImage, setDiceRollImage] = useState<string>("");
  const [diceRollImage1, setDiceRollImage1] = useState<string>("");
  const [diceRollImage2, setDiceRollImage2] = useState<string>("");
  const [diceRollImage3, setDiceRollImage3] = useState<string>("");
  const [showEthValue, setShowEthValue] = useState<boolean>(true);
  // const [claiming, setClaiming] = useState<boolean>(false);

  // const { address } = useAccount();

  // // Get access to the deployed contract object
  // const { data: diceGame } = useScaffoldContract({ contractName: "DiceGame" });
  // // console.log("diceGame: ", diceGame);

  // Call the rollTheDice function in the DiceGame smart contract.
  const {
    writeAsync,
    isSuccess: rollSuccessful,
    isError: rollError,
    isMining: isRollMinning,
  } = useScaffoldContractWrite({
    contractName: "DiceGame",
    functionName: "rollTheDice",
    value: ROLL_VALUE,
  });

  // Handle roll success.
  useEffect(() => {
    if (isRollMinning) {
      setDiceRollImage("ROLL");
      setDiceRollImage1("ROLL1");
      setDiceRollImage2("ROLL2");
      setDiceRollImage3("ROLL3");
    } else if (rollSuccessful) {
      setDiceRolled(false);
      setDiceRollImage(players[players.length - 1]?.roll);
      setDiceRollImage1(players[players.length - 1]?.roll1);
      setDiceRollImage2(players[players.length - 1]?.roll2);
      setDiceRollImage3(players[players.length - 1]?.roll3);
    }
  }, [rollSuccessful, players]);

  // Handle roll error.
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (rollError) {
      timeoutId = setTimeout(() => {
        setDiceRolled(false);
        setDiceRollImage("");
        setDiceRollImage1("");
        setDiceRollImage2("");
        setDiceRollImage3("");
      }, 2000); // delay for 2 seconds
    }
    return () => clearTimeout(timeoutId);
  }, [rollError]);

  // Call the riggedRoll function in the RiggedRoll smart contract.
  // const { writeAsync: riggedRollWrite, isSuccess: riggedRollSuccessful, isError: riggedRollError, isMining: riddedRollMinning } = useScaffoldContractWrite({
  //   contractName: "RiggedRoll",
  //   functionName: "riggedRoll",
  // });

  // Handle riggedRoll success.

  // Handle riggedRoll error.

  // Read prize data
  const { data: prize } = useScaffoldContractRead({
    contractName: "DiceGame",
    functionName: "prize",
  });

  const ETHPrice = useEthPrice();
  // Calculate the prize value to be displayed based on the toggle state
  const prizeValue = prize && valueDisplay(prize);

  // A function to help toggle between ETH value and dollar value.
  function valueDisplay(value: BigNumber) {
    const displayValue = showEthValue
      ? value && Number(formatEther(value)).toFixed(5)
      : (value && Number(formatEther(value)) * ETHPrice)?.toFixed(2) || "0";

    return displayValue;
  }

  // Subscribe to the Roll event and set the players state.


  useScaffoldEventSubscriber({
    contractName: "DiceGame",
    eventName: "Roll",
    listener: (player, roll, roll1, roll2, roll3) => {
      const numberRolled = roll?.toNumber().toString(16).toUpperCase();
      const numberRolled1 = roll1?.toNumber().toString(16).toUpperCase();
      const numberRolled2 = roll2?.toNumber().toString(16).toUpperCase();
      const numberRolled3 = roll3?.toNumber().toString(16).toUpperCase();
      setPlayers((prevPlayers): Players[] => [...prevPlayers, { player, roll: numberRolled, roll1: numberRolled1, roll2: numberRolled2, roll3: numberRolled3}]);
    },

  });

  // useScaffoldEventSubscriber({
  //   contractName: "DiceGame",
  //   eventName: "Roll",
  //   listener: (player, roll, roll1, roll2, roll3) => {
  //     const numberRolled = roll?.toNumber().toString(16).toUpperCase();
  //     const numberRolled1 = roll1?.toNumber().toString(16).toUpperCase();
  //     const numberRolled2 = roll2?.toNumber().toString(16).toUpperCase();
  //     const numberRolled3 = roll3?.toNumber().toString(16).toUpperCase();
  //     setPlayers((prevPlayers): Players[] => [...prevPlayers, { player, roll: numberRolled, numberRolled1, numberRolled2, numberRolled3}]);
  //   },
  // });

  // Subscribe to the Winner event and set the winners state.
  useScaffoldEventSubscriber({
    contractName: "DiceGame",
    eventName: "Winner",
    listener: (winner, matched, amount) => {
      setWinners((prevWinners): Winners[] => [...prevWinners, { winner, matched: matched.toString(), amount: formatEther(amount) }]);
      // console.log(winner, amount);
    },
  });

  // The butten calls this function to initiate the dice roll.
  const rollTheDice = async () => {
    setDiceRolled(true);
    setDiceRollImage("ROLL");
    setDiceRollImage1("ROLL1");
    setDiceRollImage2("ROLL2");
    setDiceRollImage3("ROLL3");

    try {
      await writeAsync();
    } catch (err) {
      // Handle the error.
      console.error(err);
    }
  };

  // Dice image manipulation.
  let diceRollImg;
  if (diceRollImage) {
    diceRollImg = (
      <Image className="rounded-xl" width={100} height={80} src={`/images/${diceRollImage}.png`} alt={"Dice Image"} unoptimized />
    );
  }

  let diceRollImg1;
  if (diceRollImage1) {
    diceRollImg1 = (
      <Image className="rounded-xl" width={100} height={80} src={`/images/${diceRollImage1}.png`} alt={"Dice Image"} unoptimized />
    );
  }

  let diceRollImg2;
  if (diceRollImage2) {
    diceRollImg2 = (
      <Image className="rounded-xl" width={100} height={80} src={`/images/${diceRollImage2}.png`} alt={"Dice Image"} unoptimized />
    );
  }

  let diceRollImg3;
  if (diceRollImage3) {
    diceRollImg3 = (
      <Image className="rounded-xl" width={100} height={80} src={`/images/${diceRollImage3}.png`} alt={"Dice Image"} unoptimized />
    );
  }

  return (
    <>
      <Head>
        <title>Lotto Impact</title>
        <meta name="description" content="New conceopt of Universal Basic Income!" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-5">
        <h1 className="text-md font-semibold tracking-widest py-5 text-center">Lotto for Social Impack!</h1>

        <div className="flex-grow bg-base-300 w-full px-8 py-5">
          <div className="items-center py-3 text-center">
            <button className="tracking-widest font-semibold text-2xl" onClick={() => setShowEthValue(prev => !prev)}>
              {showEthValue ? "⟠" : "💲"} {prizeValue} {showEthValue ? "ETH" : "USD"}
            </button>
          </div>
          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-12 m-auto">
            <div className="flex flex-col -order-first lg:order-none bg-base-100 px-4 py-2 w-full lg:min-w-[25%] min-h-[300px] text-center items-center max-w-xs rounded-3xl">
              <h2 className="text-lg tracking-widest uppercase font-bold mb-4">Trial</h2>
              <ul>
                {players
                  .slice()
                  .reverse()
                  .map(({ player, roll, roll1, roll2, roll3 }, i) => (
                    <li key={i} className="flex flex-row tracking-widest py-2 items-center text-base">
                      <Address address={player} /> &nbsp;Roll:&nbsp;{roll}&nbsp;{roll1}&nbsp;{roll2}&nbsp;{roll3}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center w-full lg:min-w-[25%] min-h-[300px] bg-base-100 px-7 py-7 text-center items-center max-w-xs rounded-3xl">
              <button disabled={diceRolled} className="btn rounded-lg" onClick={rollTheDice}>
                Start!
              </button>
              <div className="my-4 transition ease-in-out delay-150 duration-200">{diceRollImg}</div>
              <div className="my-4 transition ease-in-out delay-150 duration-200">{diceRollImg1}</div>
              <div className="my-4 transition ease-in-out delay-150 duration-200">{diceRollImg2}</div>
              <div className="my-4 transition ease-in-out delay-150 duration-200">{diceRollImg3}</div>
            </div>
            <div className="flex flex-col flex-grow order-last lg:-order-none lg:min-w-[25%] w-full min-h-[300px] bg-base-100 px-4 py-2 text-center items-center max-w-xs rounded-3xl">
              <h2 className="text-lg tracking-widest uppercase font-bold mb-4">Matched</h2>
              <ul>
                {winners
                  .slice()
                  .reverse()
                  .map(({ winner, matched, amount }, i) => (
                    <li key={i} className="flex flex-row items-center py-2 tracking-widest text-sm">
                      <Address address={winner} />
                      &nbsp;Matched:&nbsp; {matched} &nbsp;
                      &nbsp;Prize:&nbsp;
                      <button className="flex flex-row w-full">
                        { "⟠" }&nbsp;{Number(amount).toFixed(5)}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
