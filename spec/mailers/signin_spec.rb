require "rails_helper"

RSpec.describe SigninMailer, type: :mailer do
  describe "send_confirmation_email" do
    let(:user) { FactoryBot.create(:user) }
    let(:mail) { SigninMailer.send_magic_link(user) }

    it "renders the headers" do
      expect(mail.subject).to eq("Sign in to Leftover Dough")
      expect(mail.to).to eq([user.email])
      expect(mail.from).to eq(["mailer@leftoverdough.com"])
    end

    it "renders the body" do
      expect(mail.body.encoded).to match("Sign in to your account by using the button below")
      expect(mail.body.encoded).to match("This button will last for 15 minutes")
      expect(mail.body.encoded).to match("Any new buttons sent after this will disable this one")
      expect(mail.body.encoded).to include(root_url(magicLinkToken: user.magic_signin_token))
    end
  end
end
