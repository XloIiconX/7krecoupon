"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface CouponResult {
  code: string
  status: "success" | "used" | "error"
  message: string
}

export default function NetmarbleCouponRedeemer() {
  const [pid, setPid] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<CouponResult[]>([])
  const [progress, setProgress] = useState(0)
  const [currentCode, setCurrentCode] = useState("")

  const codes = [
    "RINKARMA",
    "GUILDWAR",
    "7SENASENA7",
    "GOODLUCK",
    "THANKYOU",
    "LOVELYRUBY",
    "REBIRTHBACK",
    "BONVOYAGE",
    "YONGSANIM",
    "TREASURE",
    "WELCOMEBACK",
    "THEMONTHOFSENA",
    "EVANKARIN",
    "DARKKNIGHTS",
    "SENAHAJASENA",
    "CMMAY",
    "7777777",
    "LOVESENA",
    "INFINITETOWER",
    "UPDATES",
    "SENARAID",
    "SENAEVENTS",
    "SECRETCODE",
    "MAILBOX",
    "YUISSONG",
    "RELEASEPET",
    "MOREKEYS",
    "WELCOMESENA",
    "HEROSOMMON",
    "SENAREGOGO",
    "SHOWMETHEMONEY",
    "PDKIMJUNGKI",
    "INFOCODEX",
    "THEHOLYCROSS",
    "FUSEGETSPECIAL",
    "ADVENTURER",
    "NOHOSCHRONICLE",
    "VALKYRIE",
    "LEGENDSRAID",
    "STORYEVENT",
    "SURPRISE",
    "INTOTHESENA",
  ]

  const redeemCoupons = async () => {
    if (!pid || pid.length < 8) {
      alert("PID must be at least 8 characters long.")
      return
    }

    setIsRunning(true)
    setResults([])
    setProgress(0)

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (CouponScript)",
      Origin: "https://coupon.netmarble.com",
      Referer: "https://coupon.netmarble.com/tskgb",
    }

    const basePayload = {
      gameCode: "tskgb",
      langCd: "KO_KR",
      pid: pid,
    }

    for (let i = 0; i < codes.length; i++) {
      const code = codes[i]
      setCurrentCode(code)

      try {
        const payload = {
          ...basePayload,
          couponCode: code,
        }

        const response = await fetch("/api/redeem-coupon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payload, headers }),
        })

        const data = await response.json()

        let result: CouponResult
        if (data.error) {
          result = { code, status: "error", message: data.error }
        } else {
          const { errorCode, errorMessage, resultCd, message } = data

          if (errorCode === 24004 || /이미|초과/.test(errorMessage || "")) {
            result = { code, status: "used", message: "Already used code" }
          } else if (resultCd === "00" || /정상/.test(message || "")) {
            result = { code, status: "error", message: errorMessage || "API returned success code" }
          } else {
            result = { code, status: "success", message: "Successfully redeemed" }
          }
        }

        setResults((prev) => [...prev, result])
        setProgress(((i + 1) / codes.length) * 100)

        // 2초 대기
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        const result: CouponResult = {
          code,
          status: "error",
          message: error instanceof Error ? error.message : "Network error",
        }
        setResults((prev) => [...prev, result])
        setProgress(((i + 1) / codes.length) * 100)
      }
    }

    setIsRunning(false)
    setCurrentCode("")
  }

  const getStatusIcon = (status: CouponResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "used":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusBadge = (status: CouponResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Success
          </Badge>
        )
      case "used":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Used
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Seven Knights Rebirth Coupon Auto Redeemer</CardTitle>
            <CardDescription className="text-center">
              Treasure Hunt Event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pid">UID (Player ID copy from ingame setting)</Label>
              <Input
                id="pid"
                type="text"
                placeholder="Enter your UID here (minimum 8 characters)"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                disabled={isRunning}
              />
            </div>

            <Button onClick={redeemCoupons} disabled={isRunning || !pid || pid.length < 8} className="w-full">
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redeeming coupons...
                </>
              ) : (
                "Start Coupon Redemption"
              )}
            </Button>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress: {Math.round(progress)}%</span>
                  <span>Current code: {currentCode}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Coupon Redemption Results</CardTitle>
              <CardDescription>
                Total {results.length} codes - Success: {results.filter((r) => r.status === "success").length}, Already
                used: {results.filter((r) => r.status === "used").length}, Errors:{" "}
                {results.filter((r) => r.status === "error").length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <span className="font-mono text-sm">{result.code}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(result.status)}
                        <span className="text-sm text-gray-600">{result.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <Alert className="mt-6">
          <AlertDescription>
            This tool isn't official Netmarble tool.
            This tool uses the official Netmarble coupon API. There is a 2-second delay between each coupon redemption
            for safe operation.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
