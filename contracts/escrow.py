# { "Depends": "py-genlayer:test" }

from genlayer import *


class EscrowContract(gl.Contract):
    buyer: Address
    seller: Address
    amount: u256
    description: str

    is_funded: bool
    is_complete: bool
    is_disputed: bool
    dispute_reason: str

    def __init__(self, seller_address: str, description: str):
        self.buyer = gl.message.sender_address
        self.seller = Address(seller_address)
        self.description = description

        self.amount = u256(0)
        self.is_funded = False
        self.is_complete = False
        self.is_disputed = False
        self.dispute_reason = ""

    @gl.public.write
    def fund_escrow(self, amount: int):
        assert gl.message.sender_address == self.buyer, "Only buyer can fund"
        assert not self.is_funded, "Already funded"
        assert amount > 0, "Send positive amount"

        self.amount = u256(amount)
        self.is_funded = True

    @gl.public.write
    def confirm_delivery(self):
        assert gl.message.sender_address == self.buyer, "Only buyer can confirm"
        assert self.is_funded, "Not funded"
        assert not self.is_complete, "Already complete"
        assert not self.is_disputed, "In dispute"

        self.is_complete = True
        gl.transfer(self.seller, int(self.amount))

    @gl.public.write
    def raise_dispute(self, reason: str):
        assert self.is_funded, "Not funded"
        assert not self.is_complete, "Already complete"
        assert not self.is_disputed, "Already disputed"

        self.is_disputed = True
        self.dispute_reason = reason

        # Only copy strings to memory
        desc_mem = gl.storage.copy_to_memory(self.description)

        def judge() -> str:
            prompt = (
                "You are an escrow arbitrator.\n"
                "Return ONLY one word: REFUND or RELEASE.\n\n"
                f"Item: {desc_mem}\n"
                f"Amount: {int(self.amount)}\n"
                f"Reason: {reason}\n"
            )
            return gl.exec_prompt(prompt)

        decision = gl.eq_principle_strict_eq(judge)
        decision_up = str(decision).strip().upper()

        self.is_complete = True

        if decision_up == "REFUND":
            gl.transfer(self.buyer, int(self.amount))
        else:
            gl.transfer(self.seller, int(self.amount))

    @gl.public.write
    def cancel_escrow(self):
        assert gl.message.sender_address == self.buyer, "Only buyer can cancel"
        assert self.is_funded, "Not funded"
        assert not self.is_complete, "Already complete"
        assert not self.is_disputed, "In dispute"

        self.is_complete = True
        gl.transfer(self.buyer, int(self.amount))

    @gl.public.view
    def get_status(self) -> str:
        if self.is_complete:
            status = "COMPLETED"
        elif self.is_disputed:
            status = "DISPUTED"
        elif self.is_funded:
            status = "FUNDED"
        else:
            status = "CREATED"

        return (
            f"buyer:{self.buyer.as_hex}|"
            f"seller:{self.seller.as_hex}|"
            f"amount:{int(self.amount)}|"
            f"description:{self.description}|"
            f"status:{status}|"
            f"disputed:{self.is_disputed}|"
            f"dispute_reason:{self.dispute_reason}"
        )
