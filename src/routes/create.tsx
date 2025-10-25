import { Text, Grid, GridItem, VStack, Box, Button } from '@chakra-ui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import '../style/fonts.css'

import { BsMagic, BsPeople } from "react-icons/bs";
import { LuBaby } from "react-icons/lu";
import { RiHomeHeartLine, RiShieldStarLine } from "react-icons/ri";
import { FaRegFaceSmile } from "react-icons/fa6";
import { TbHeartBroken, TbHeart, TbConfetti } from "react-icons/tb";
import { COLOR } from '../components/ui/colors';
import { PawIcon } from '../assets/svg/paw';
import { useState } from 'react';
import { Popup } from '../components/Popup';

export const Route = createFileRoute('/create')({
    component: RouteComponent,
})

function RouteComponent() {
    // const categories = ['self', 'friend', 'broken-heart', 'love', 'relation', 'baby', 'hero', 'congrats', 'others']
    

    return <>
        


    </>
}
