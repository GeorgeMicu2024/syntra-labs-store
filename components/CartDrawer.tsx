async function checkout() {
  if (!items.length || checkingOut) {
    return;
  }

  try {
    setCheckingOut(true);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    /*
     * Get authenticated Supabase session.
     */
    const supabase = getBrowserSupabase();

    if (supabase) {
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "Supabase session error:",
          sessionError
        );
      }

      const accessToken =
        sessionData.session?.access_token;

      /*
       * If UI believes the customer is logged in,
       * don't silently checkout as guest.
       */
      if (user && !accessToken) {
        throw new Error(
          "Your member session has expired. Please sign in again."
        );
      }

      if (accessToken) {
        headers.Authorization =
          `Bearer ${accessToken}`;
      }
    }

    /*
     * Create Stripe Checkout Session.
     * All pricing and discount calculations happen
     * securely on the server.
     */
    const response = await fetch(
      "/api/checkout",
      {
        method: "POST",
        headers,

        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
          })),

          useCredit,
        }),
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    console.log(
      "CHECKOUT RESPONSE:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Checkout is currently unavailable."
      );
    }

    /*
     * Backend is the pricing authority.
     *
     * We only verify that Stripe returned
     * a valid Checkout URL.
     */
    if (
      !data.url ||
      typeof data.url !== "string"
    ) {
      throw new Error(
        "Stripe Checkout URL was not returned."
      );
    }

    /*
     * Stripe URLs should always be HTTPS.
     */
    if (
      !data.url.startsWith(
        "https://checkout.stripe.com/"
      )
    ) {
      console.error(
        "Unexpected Stripe URL:",
        data.url
      );

      throw new Error(
        "The secure checkout URL is invalid."
      );
    }

    /*
     * Redirect to Stripe.
     */
    window.location.assign(data.url);
  } catch (error) {
    console.error(
      "CHECKOUT CLIENT ERROR:",
      error
    );

    setCheckingOut(false);

    window.dispatchEvent(
      new CustomEvent(
        "syntra:toast",
        {
          detail:
            error instanceof Error
              ? error.message
              : "Checkout unavailable",
        }
      )
    );
  }
}