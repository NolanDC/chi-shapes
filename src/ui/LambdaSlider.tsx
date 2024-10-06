import styled from "@emotion/styled"
import { Popover, Slider, Text } from "@mantine/core"
import { useState } from "react"
import LambdaModal from "../modals/LambdaModal"
import { HelpCircle } from "lucide-react"

const LambdaSliderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-contnet: center;
`
const LambdaIcon = styled.div`
  background: #4997bd;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  text-align: center;
  line-height: 27px;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
  margin-right: 15px;
`

const LambdaValue = styled.div`
  margin-left: 10px;
  width: 35px;
  flex-shrink: 0;
`

const HelpButton = styled(HelpCircle)`
  color: gray;
  width: 30px;
  margin-left: 10px;
  cursor: pointer;
  &:hover {
    color: black;
  }
`

interface LambdaSliderProps {
  lambda: number;
  setLambda: (n: number) => void;
}

export const LambdaSlider = ({ lambda, setLambda }: LambdaSliderProps) => {

  const [showLambdaPopover, setShowLambdaPopover] = useState(false)
   
  return (
    <LambdaSliderContainer>
      <LambdaIcon><span>λ<sub>p</sub></span></LambdaIcon>
      <LambdaModal opened={showLambdaPopover} onClose={() => setShowLambdaPopover(false)}/>
      <Slider
        value={lambda}
        onChange={setLambda}
        min={0}
        max={1}
        step={0.01}
        label={(value) => value.toFixed(2)}
        styles={{ root: { width: '100%' } }}
      />
      <LambdaValue>
        {lambda}
      </LambdaValue>
      <HelpButton onClick={() => setShowLambdaPopover(true)}/>
    </LambdaSliderContainer>
  )
}
